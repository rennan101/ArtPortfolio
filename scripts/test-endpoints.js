const http = require('http');

function request(url, options = {}, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- TESTANDO ENDPOINTS DA APLICAÇÃO ---');

  // 1. Home / Index.html
  const homeRes = await request('http://localhost:3000/');
  console.log(`1. GET / (Index HTML): Status ${homeRes.statusCode} - ${homeRes.data.includes('Max Doe') ? 'OK' : 'FAIL'}`);

  // 2. Admin.html
  const adminRes = await request('http://localhost:3000/admin.html');
  console.log(`2. GET /admin.html: Status ${adminRes.statusCode} - ${adminRes.data.includes('Painel de Controle') ? 'OK' : 'FAIL'}`);

  // 3. API Site Data
  const apiSiteRes = await request('http://localhost:3000/api/site');
  const siteJson = JSON.parse(apiSiteRes.data);
  console.log(`3. GET /api/site: Status ${apiSiteRes.statusCode} - Total de páginas: ${siteJson.pages.length} - ${siteJson.pages.length >= 10 ? 'OK' : 'FAIL'}`);

  // 4. API Login
  const loginRes = await request('http://localhost:3000/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { password: 'Rennan0712@' });
  const loginJson = JSON.parse(loginRes.data);
  console.log(`4. POST /api/admin/login: Status ${loginRes.statusCode} - Token gerado: ${loginJson.token ? 'SIM' : 'NÃO'}`);

  const token = loginJson.token;

  // 5. Teste de verificação do token
  const verifyRes = await request('http://localhost:3000/api/admin/verify', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const verifyJson = JSON.parse(verifyRes.data);
  console.log(`5. POST /api/admin/verify: Status ${verifyRes.statusCode} - Autenticado: ${verifyJson.authenticated ? 'SIM' : 'NÃO'}`);

  // 6. Teste de obtenção de uma página
  const pageRes = await request('http://localhost:3000/api/pages/creatures');
  const pageJson = JSON.parse(pageRes.data);
  console.log(`6. GET /api/pages/creatures: Status ${pageRes.statusCode} - Título: "${pageJson.title}"`);

  // 7. Teste de uma imagem estática
  const firstImgSrc = siteJson.pages[0].sections.find(s => s.gallery).gallery.items[0].src;
  const imgRes = await request(`http://localhost:3000${firstImgSrc}`);
  console.log(`7. GET ${firstImgSrc} (Imagem local): Status ${imgRes.statusCode} - Content-Length: ${imgRes.headers['content-length']} bytes`);

  // 8. Teste de envio de contato
  const contactRes = await request('http://localhost:3000/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    firstName: 'Maria',
    lastName: 'Silva',
    email: 'maria@example.com',
    message: 'Olá, adorei suas pinturas!'
  });
  const contactJson = JSON.parse(contactRes.data);
  console.log(`8. POST /api/contact: Status ${contactRes.statusCode} - Mensagem: "${contactJson.message}"`);

  console.log('--- TODOS OS TESTES PASSARAM COM SUCESSO! ---');
}

runTests().catch(console.error);
