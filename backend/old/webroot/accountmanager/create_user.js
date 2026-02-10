const http = require('http');

const SERVER_URL = 'http://127.0.0.1:10999';
const API_ENDPOINT = '/api/account/register';

function createUser(username, email, password) {
    const data = JSON.stringify({
        username: username,
        email: email,
        password: password
    });

    const url = new URL(SERVER_URL);
    
    const options = {
        hostname: url.hostname,
        port: url.port || 10999,
        path: API_ENDPOINT,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data)
        }
    };

    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                try {
                    const jsonResponse = JSON.parse(responseData);
                    resolve({
                        statusCode: res.statusCode,
                        data: jsonResponse
                    });
                } catch (e) {
                    resolve({
                        statusCode: res.statusCode,
                        data: responseData
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(data);
        req.end();
    });
}

const username = process.argv[2];
const email = process.argv[3];
const password = process.argv[4];

if (!username || !email || !password) {
    console.log('Uso: node create_user.js <username> <email> <password>');
    console.log('');
    console.log('Exemplo:');
    console.log('  node create_user.js meuusuario meuemail@exemplo.com minhasenha123');
    process.exit(1);
}

createUser(username, email, password)
    .then((result) => {
        console.log('Status:', result.statusCode);
        console.log('Resposta:', JSON.stringify(result.data, null, 2));
        
        if (result.statusCode === 200 && result.data.error === 'Success') {
            console.log('\n✓ Usuário criado com sucesso!');
        } else if (result.data.error) {
            console.log('\n✗ Erro:', result.data.error);
        }
    })
    .catch((error) => {
        console.error('Erro ao criar usuário:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error('\nO servidor não está rodando em', SERVER_URL);
            console.error('Certifique-se de que o servidor está ativo na porta 10999');
        }
        process.exit(1);
    });

