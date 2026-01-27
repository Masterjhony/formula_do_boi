import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hghtikjaqixglmpujbwj.supabase.co'
const supabaseKey = 'sb_publishable_vJOlqhiqa7Rbw3RZJ54asQ_wQ4OlyD3'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
    console.log('Testing connection...')
    try {
        const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true })

        if (error) {
            console.error('Error connecting:', error.message)
        } else {
            console.log('Connection successful! Count:', data)
        }
    } catch (err: any) {
        console.error('Exception:', err.message)
    }
}

testConnection()
