const fs = require('fs');
const path = require('path');

const CLOUD_NAME = "duskoy255";
const UPLOAD_PRESET = "Portfolio_uploads";
const FILE_PATH = path.join(__dirname, 'assets', 'Jabbar_khan_resume.pdf');
const API_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;

async function uploadFile() {
    if (!fs.existsSync(FILE_PATH)) {
        console.error("File not found:", FILE_PATH);
        return;
    }

    console.log("Uploading:", FILE_PATH);
    
    try {
        const fileBuffer = fs.readFileSync(FILE_PATH);
        const blob = new Blob([fileBuffer]); // Node 18+ supports Blob
        
        const formData = new FormData();
        formData.append('file', blob, 'Jabbar_khan_resume.pdf');
        formData.append('upload_preset', UPLOAD_PRESET);
        formData.append('resource_type', 'auto');

        const response = await fetch(API_URL, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        
        if (data.error) {
            console.error("Cloudinary Error:", data.error);
        } else {
            console.log("\n--- UPLOAD SUCCESS! ---");
            console.log("URL:", data.secure_url);
            console.log("-----------------------\n");
            
            // Write the URL to a temp file so I can read it
            fs.writeFileSync(path.join(__dirname, 'resume_url.txt'), data.secure_url);
        }

    } catch (e) {
        console.error("Upload failed:", e);
    }
}

uploadFile();
