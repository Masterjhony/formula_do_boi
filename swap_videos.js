require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function swapVideos() {
  const { data: records, error } = await supabase
    .from('products')
    .select('id, image_url, gallery')
    .in('id', [346, 347]);

  if (error) {
    console.error("Fetch Error:", error);
    return;
  }

  const bnse4 = records.find(r => r.id === 347); // BRASILIA (BNSE 4)
  const bnse5 = records.find(r => r.id === 346); // BRAGANCA (BNSE 5)

  if (bnse4 && bnse5) {
    const bnse4Video = bnse4.image_url;
    const bnse4Gallery = bnse4.gallery;
    
    const bnse5Video = bnse5.image_url;
    const bnse5Gallery = bnse5.gallery;

    // Set 347 (BNSE 4) to BNSE 5's video
    await supabase.from('products').update({
      image_url: bnse5Video,
      gallery: bnse5Gallery
    }).eq('id', 347);
    console.log("Updated BNSE 4 (347) with video: ", bnse5Video);

    // Set 346 (BNSE 5) to BNSE 4's video
    await supabase.from('products').update({
      image_url: bnse4Video,
      gallery: bnse4Gallery
    }).eq('id', 346);
    console.log("Updated BNSE 5 (346) with video: ", bnse4Video);
  }
}
swapVideos();
