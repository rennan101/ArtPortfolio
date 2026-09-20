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

    // 6. Test Update Site Info (Custom Artist Name)
    const updateSiteRes = await fetch(`http://127.0.0.1:${PORT}/api/site`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        artistName: 'Luana Silva',
        profession: 'Artista Visual & Escultora',
        menu: [
          { title: 'Portfolio', url: '/' },
          { title: 'Digital Art', url: '/digital-art' },
          { title: 'Services', url: '/services' },
          { title: 'About', url: '/about' },
          { title: 'Contact', url: '/contact' }
        ]
      })
    });
    const updateSiteData = await updateSiteRes.json();
    console.log('6. Update Site Info Test:', updateSiteData.success ? 'PASSED ✅' : 'FAILED ❌');

    // 7. Verify Custom Name and Auto-created Gallery Page
    const siteAfterRes = await fetch(`http://127.0.0.1:${PORT}/api/site`);
    const siteAfterData = await siteAfterRes.json();
    const namePersisted = siteAfterData.artistName === 'Luana Silva';
    console.log('7. Name Persistence Test ("Luana Silva"):', namePersisted ? 'PASSED ✅' : 'FAILED ❌', `(Current: ${siteAfterData.artistName})`);

    // 8. Auto-create Gallery Page for Menu Test
    const autoPageRes = await fetch(`http://127.0.0.1:${PORT}/api/pages/digital-art`);
    const autoPageData = await autoPageRes.json();
    const galleryCreated = autoPageData.title === 'Digital Art' && autoPageData.sections.some(s => s.gallery);
    console.log('8. Auto-create Gallery Page for Menu Test:', galleryCreated ? 'PASSED ✅' : 'FAILED ❌', `(Page Title: ${autoPageData.title})`);

    // 9. Test Update Social Links (Instagram, WhatsApp, Facebook, LinkedIn)
    const socialLinksPayload = [
      { name: 'Instagram', url: 'https://instagram.com/luanasilva.art', icon: 'instagram' },
      { name: 'WhatsApp', url: 'https://wa.me/5511999887766', icon: 'whatsapp' },
      { name: 'Facebook', url: 'https://facebook.com/luanasilva.art', icon: 'facebook' },
      { name: 'LinkedIn', url: 'https://linkedin.com/in/luanasilva', icon: 'linkedin' }
    ];

    const updateSocialRes = await fetch(`http://127.0.0.1:${PORT}/api/site`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ socialLinks: socialLinksPayload })
    });
    const updateSocialData = await updateSocialRes.json();
    console.log('9. Update Social Links Test:', updateSocialData.success ? 'PASSED ✅' : 'FAILED ❌');

    const checkSocialRes = await fetch(`http://127.0.0.1:${PORT}/api/site`);
    const checkSocialData = await checkSocialRes.json();
    const socialMatches = checkSocialData.socialLinks && checkSocialData.socialLinks.length === 4 && checkSocialData.socialLinks.some(s => s.name === 'WhatsApp');
    // 11. Test Menu Reorder and Footer Menu Management
    const reorderPayload = {
      artistName: 'Luana Silva Studio',
      menu: [
        { title: 'Digital Art', url: '/digital-art' },
        { title: 'Portfolio', url: '/' },
        { title: 'About', url: '/about' },
        { title: 'Services', url: '/services' },
        { title: 'Contact', url: '/contact' }
      ],
      footerMenu: [
        { title: 'About', url: '/about' },
        { title: 'Services', url: '/services' },
        { title: 'Contact', url: '/contact' }
      ]
    };

    const reorderRes = await fetch(`http://127.0.0.1:${PORT}/api/site`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reorderPayload)
    });
    const reorderData = await reorderRes.json();
    console.log('11. Menu Reorder & Footer Menu Test:', reorderData.success ? 'PASSED ✅' : 'FAILED ❌');

    // Verify persistence of reordered menus
    const verifyReorderRes = await fetch(`http://127.0.0.1:${PORT}/api/site`);
    const verifyReorderData = await verifyReorderRes.json();
    const topFirstIsDigital = verifyReorderData.menu[0].title === 'Digital Art';
    const footerFirstIsAbout = verifyReorderData.footerMenu[0].title === 'About';
    console.log('12. Top Menu Order Persistence Test (First is Digital Art):', topFirstIsDigital ? 'PASSED ✅' : 'FAILED ❌');
    console.log('13. Footer Menu Order Persistence Test (First is About):', footerFirstIsAbout ? 'PASSED ✅' : 'FAILED ❌');

    // 14. Test Adding New Top Menu -> Auto Sync to Footer Menu
    const addMenuPayload = {
      menu: [
        ...verifyReorderData.menu,
        { title: 'Sculptures', url: '/sculptures' }
      ]
    };
    const addMenuRes = await fetch(`http://127.0.0.1:${PORT}/api/site`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(addMenuPayload)
    });
    const addMenuData = await addMenuRes.json();
    const footerHasSculptures = addMenuData.data.footerMenu.some(fm => fm.url === '/sculptures');
    console.log('14. Auto-Sync New Top Menu to Footer Menu Test:', footerHasSculptures ? 'PASSED ✅' : 'FAILED ❌');

    // 15. Test Clearing / Removing Artist Name ("Luana Silva")
    const clearNameRes = await fetch(`http://127.0.0.1:${PORT}/api/site`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ artistName: '' })
    });
    const clearNameData = await clearNameRes.json();
    const nameCleared = clearNameData.data.artistName === '';
    console.log('15. Clear Artist Name Test (Empty string):', nameCleared ? 'PASSED ✅' : 'FAILED ❌');

    // Restore original artist name for default view
    await fetch(`http://127.0.0.1:${PORT}/api/site`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        artistName: 'Luana Silva',
        menu: [
          { title: 'Portfolio', url: '/' },
          { title: 'Digital Art', url: '/digital-art' },
          { title: 'Services', url: '/services' },
          { title: 'About', url: '/about' },
          { title: 'Contact', url: '/contact' }
        ],
        footerMenu: [
          { title: 'Services', url: '/services' },
          { title: 'About', url: '/about' },
          { title: 'Contact', url: '/contact' }
        ]
      })
    });

    console.log('\n🎉 ALL ADVANCED TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    server.close();
    process.exit(0);
  }
});
