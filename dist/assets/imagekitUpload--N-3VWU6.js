const d=async(t,r)=>{const o=Date.now().toString(),i=Math.floor(Date.now()/1e3)+2400,s=o+i,e=new TextEncoder,n=e.encode(r),p=e.encode(s),a=await crypto.subtle.importKey("raw",n,{name:"HMAC",hash:"SHA-1"},!1,["sign"]),c=await crypto.subtle.sign("HMAC",a,p),u=Array.from(new Uint8Array(c)).map(l=>l.toString(16).padStart(2,"0")).join("");return{token:o,expire:i,signature:u}},m=async t=>{var s;const r="public_oWpq3oE1DKmK9VZOI+k9O7D9x+Q=",o="private_wj31zPivosCwa9imW+qQvkmKHug=";if(!t.type.startsWith("image/"))throw new Error("Only image files are allowed");const i=10*1024*1024;if(t.size>i)throw new Error("Image size must be less than 10MB");try{const e=new FormData;if(e.append("file",t),e.append("publicKey",r),e.append("fileName",`${Date.now()}_${t.name.replace(/\s+/g,"_")}`),e.append("folder","/yummyfi-products"),e.append("useUniqueFileName","true"),o){console.log("🔐 Using signed upload with private key");const a=await d(r,o);e.append("signature",a.signature),e.append("expire",a.expire.toString()),e.append("token",a.token)}const n=await fetch("https://upload.imagekit.io/api/v1/files/upload",{method:"POST",body:e});if(!n.ok){const a=await n.json();throw console.error("ImageKit error response:",a),(s=a.message)!=null&&s.includes("authorization parameters")?new Error(`❌ ImageKit Authorization Failed!

OPTION 1 (Recommended): Add private key to .env
VITE_IMAGEKIT_PRIVATE_KEY=private_your_key_here

OPTION 2: Enable unsigned uploads:
1. Go to: https://imagekit.io/dashboard/settings/security
2. Turn ON "Allow unsigned file uploads"
3. Click Save
4. Try uploading again`):new Error(a.message||"Failed to upload image to ImageKit")}const p=await n.json();return console.log("✅ ImageKit upload successful:",p.url),p.url}catch(e){throw console.error("❌ ImageKit upload error:",e),e}};export{m as uploadToImageKit};
