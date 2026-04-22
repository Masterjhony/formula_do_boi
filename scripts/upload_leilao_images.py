import zipfile
import os
import requests
import tempfile

SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://hghtikjaqixglmpujbwj.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
BUCKET = "leilao-covers"

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
}

# Definitive mapping from Excel drawing XML analysis:
# drawing5.xml (sheet ABRIL2026): row 3 = image4.png, row 7 = image5.png,
#   row 12 = image3.jpg, row 15 = image2.jpg
# drawing6.xml (sheet MAIO2026): row 24 = image1.jpg
#
# bula_leiloes matches (by date + name):
#   image3.jpg -> 833148aa (Nelore IPB, 2026-04-11)
#   image2.jpg -> 6bc31223 (Cachoeirao, 2026-04-14)
#   image1.jpg -> 98326ae9 (Nelore Tresmar, 2026-05-21)
#   image4.png -> no bula_leiloes record (FAZENDA BELA ROSA, 2026-04-02)
#   image5.png -> no bula_leiloes record (NELORE FLOC, 2026-04-06)

IMAGE_TO_RECORD = {
    "image3.jpg": "833148aa-c411-4874-b700-2642b53dd7e6",
    "image2.jpg": "6bc31223-b49d-4231-9a4d-e43382ac1d22",
    "image1.jpg": "98326ae9-9111-41be-aeae-2aebaa97243a",
}

# Find Excel file
script_dir = os.path.dirname(os.path.abspath(__file__))
repo_dir = os.path.dirname(script_dir)
excel_path = None
for fname in os.listdir(repo_dir):
    if fname.endswith(".xlsx") and not fname.startswith("~$"):
        excel_path = os.path.join(repo_dir, fname)
        break

if not excel_path:
    raise FileNotFoundError("Excel file not found")

print(f"Excel: {excel_path}")

# Extract images from Excel zip
temp_dir = tempfile.mkdtemp()
extracted = {}

with zipfile.ZipFile(excel_path, "r") as z:
    for img_name in IMAGE_TO_RECORD:
        path_in_zip = f"xl/media/{img_name}"
        if path_in_zip in z.namelist():
            out_path = os.path.join(temp_dir, img_name)
            with open(out_path, "wb") as f:
                f.write(z.read(path_in_zip))
            extracted[img_name] = out_path
            print(f"Extracted: {img_name} ({os.path.getsize(out_path)} bytes)")
        else:
            print(f"WARNING: {path_in_zip} not found in Excel")

print(f"\nExtracted {len(extracted)} images to {temp_dir}")

# Query current bula_leiloes state
resp = requests.get(
    f"{SUPABASE_URL}/rest/v1/bula_leiloes?select=id,nome,data,img&order=data",
    headers={**HEADERS, "Content-Type": "application/json"},
)
print(f"\nbula_leiloes: {resp.status_code}")
bula_records = resp.json()
print(f"Total records: {len(bula_records)}")

# Upload each image and update the matching record
assigned_ids = set()

for img_name, record_id in IMAGE_TO_RECORD.items():
    if img_name not in extracted:
        print(f"\nSKIP {img_name} - not extracted")
        continue

    local_path = extracted[img_name]
    ext = img_name.rsplit(".", 1)[-1].lower()
    content_type = "image/jpeg" if ext in ("jpg", "jpeg") else "image/png"
    storage_path = f"bula_{record_id}.{ext}"

    # Delete any existing file with this path
    del_resp = requests.delete(
        f"{SUPABASE_URL}/storage/v1/object/{BUCKET}/{storage_path}",
        headers=HEADERS,
    )

    # Upload
    with open(local_path, "rb") as f:
        data = f.read()

    up_resp = requests.post(
        f"{SUPABASE_URL}/storage/v1/object/{BUCKET}/{storage_path}",
        headers={**HEADERS, "Content-Type": content_type},
        data=data,
    )

    if up_resp.status_code not in (200, 201):
        print(f"\nERROR uploading {img_name}: {up_resp.status_code} {up_resp.text}")
        continue

    public_url = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET}/{storage_path}"

    # Update bula_leiloes record
    patch_resp = requests.patch(
        f"{SUPABASE_URL}/rest/v1/bula_leiloes?id=eq.{record_id}",
        headers={**HEADERS, "Content-Type": "application/json"},
        json={"img": public_url},
    )

    rec_name = next((r["nome"] for r in bula_records if r["id"] == record_id), "?")
    if patch_resp.status_code in (200, 204):
        print(f"\nOK: {img_name} -> '{rec_name}' (id={record_id})")
        print(f"    URL: {public_url}")
        assigned_ids.add(record_id)
    else:
        print(f"\nERROR updating record {record_id}: {patch_resp.status_code} {patch_resp.text}")

# Clear img for all records NOT in the assignment set
print("\n--- Clearing img for unmatched records ---")
for rec in bula_records:
    if rec["id"] not in assigned_ids:
        patch_resp = requests.patch(
            f"{SUPABASE_URL}/rest/v1/bula_leiloes?id=eq.{rec['id']}",
            headers={**HEADERS, "Content-Type": "application/json"},
            json={"img": None},
        )
        status = "OK" if patch_resp.status_code in (200, 204) else f"ERROR {patch_resp.status_code}"
        had_img = "had img" if rec.get("img") else "no img"
        print(f"  {status}: '{rec['nome']}' ({rec['data'][:10]}) [{had_img}]")

print("\nDone!")
