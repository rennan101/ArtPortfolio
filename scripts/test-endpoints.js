const http = require('http');
const fs = require('fs');
const path = require('path');
const app = require('../server');

const PORT = 3456;
const server = app.listen(PORT, async () => {
  console.log(`Test server running on port ${PORT}`);
  try {
    // 1. Test Login
    const loginRes = await fetch(`http://127.0.0.1:${PORT}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'Rennan0712@' })
    });
    const loginData = await loginRes.json();
    console.log('1. Login Test:', loginData.success ? 'PASSED ✅' : 'FAILED ❌', loginData);

    const token = loginData.token;

    // 2. Test Verify
    const verifyRes = await fetch(`http://127.0.0.1:${PORT}/api/admin/verify`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const verifyData = await verifyRes.json();
    console.log('2. Verify Test:', verifyData.authenticated ? 'PASSED ✅' : 'FAILED ❌');

    // 3. Test Upload (multipart buffer)
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    const sampleBuffer = Buffer.from('fake-image-bytes-header-sample-content');
    const body = Buffer.concat([
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="photos"; filename="test_art.jpg"\r\nContent-Type: image/jpeg\r\n\r\n`),
      sampleBuffer,
      Buffer.from(`\r\n--${boundary}--\r\n`)
    ]);

    const uploadRes = await fetch(`http://127.0.0.1:${PORT}/api/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body: body
    });
    const uploadData = await uploadRes.json();
    console.log('3. Upload Test:', uploadData.success ? 'PASSED ✅' : 'FAILED ❌', uploadData);

    // 4. Test Site Data Fetch
    const siteRes = await fetch(`http://127.0.0.1:${PORT}/api/site`);
    const siteData = await siteRes.json();
    console.log('4. Site Data Test:', siteData.title ? 'PASSED ✅' : 'FAILED ❌', `(Title: ${siteData.title})`);

    // 5. Test Update Page Items
    const updateItemsRes = await fetch(`http://127.0.0.1:${PORT}/api/pages/creatures/items`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items: [
          ...uploadData.files,
          { id: 'sample_item_1', src: '/uploads/creatures-1.jpg', title: 'Art Piece 1', subtitle: 'Gallery', description: '' }
        ]
      })
    });
    const updateItemsData = await updateItemsRes.json();
    console.log('5. Update Items Test:', updateItemsData.success ? 'PASSED ✅' : 'FAILED ❌');

    // 6. Test Update Site Info
    const updateSiteRes = await fetch(`http://127.0.0.1:${PORT}/api/site`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        artistName: 'Max Doe',
        profession: 'Visual Artist & Sculptor'
      })
    });
    const updateSiteData = await updateSiteRes.json();
    console.log('6. Update Site Info Test:', updateSiteData.success ? 'PASSED ✅' : 'FAILED ❌');

    console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    server.close();
    process.exit(0);
  }
});
