const http = require('http');
const crypto = require('crypto');

const SERVER_URL = 'http://127.0.0.1:10999';

function sha512(text) {
    return crypto.createHash('sha512').update(text).digest('hex');
}

function getChallenge(username) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({ username: username });
        
        const options = {
            hostname: '127.0.0.1',
            port: 10999,
            path: '/api/auth/get_challenge',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        const req = http.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => responseData += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(responseData));
                } catch (e) {
                    reject(e);
                }
            });
        });
        
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

function apiRequest(endpoint, requestData) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(requestData);
        
        const options = {
            hostname: '127.0.0.1',
            port: 10999,
            path: endpoint,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        const req = http.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => responseData += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        statusCode: res.statusCode,
                        data: JSON.parse(responseData)
                    });
                } catch (e) {
                    resolve({
                        statusCode: res.statusCode,
                        data: responseData
                    });
                }
            });
        });
        
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

async function makeAdmin(adminUser, adminPass, targetUser) {
    try {
        console.log('Autenticando como admin: ' + adminUser + '...');
        
        // Step 1: Get challenge
        const challengeData = await getChallenge(adminUser);
        
        if (!challengeData.salt || !challengeData.challenge) {
            console.error('Erro: Não foi possível obter o challenge de autenticação');
            console.error('Resposta:', challengeData);
            process.exit(1);
        }
        
        const salt = challengeData.salt;
        const challenge = challengeData.challenge;
        
        // Step 2: Calculate password hash
        const passwordHash = sha512(adminPass + salt);
        
        // Step 3: Calculate challenge response
        const challengeResponse = sha512(passwordHash + challenge);
        
        // Step 4: Update account to admin (user_level = 1000)
        console.log('Promovendo "' + targetUser + '" para admin...');
        
        const updateRequest = {
            challenge: challengeResponse,
            session_username: adminUser,
            username: targetUser,
            user_level: 1000,
            enabled: true
        };
        
        const result = await apiRequest('/api/admin/update_account', updateRequest);
        
        console.log('Status:', result.statusCode);
        console.log('Resposta:', JSON.stringify(result.data, null, 2));
        
        if (result.statusCode === 200 && result.data.error === 'Success') {
            console.log('\n✓ Conta "' + targetUser + '" promovida a admin com sucesso!');
        } else if (result.data.error) {
            console.log('\n✗ Erro:', result.data.error);
            if (result.data.error.includes('admin')) {
                console.log('\nNota: A conta "' + adminUser + '" precisa ter user_level = 1000 para fazer isso.');
            }
        }
        
    } catch (error) {
        console.error('Erro:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error('\nO servidor não está rodando em ' + SERVER_URL);
        }
        process.exit(1);
    }
}

const adminUsername = process.argv[2];
const adminPassword = process.argv[3];
const targetUsername = process.argv[4] || 'testchar';

if (!adminUsername || !adminPassword) {
    console.log('Uso: node make_admin.js <admin_username> <admin_password> [target_username]');
    console.log('');
    console.log('Exemplo:');
    console.log('  node make_admin.js admin adminpass testchar');
    console.log('');
    console.log('Nota: A conta admin deve ter user_level = 1000');
    console.log('');
    console.log('Se você não tem uma conta admin ainda, você precisa:');
    console.log('  1. Acessar o banco de dados diretamente e alterar o user_level');
    console.log('  2. Ou usar o primeiro comando de setup do servidor (se houver)');
    process.exit(1);
}

makeAdmin(adminUsername, adminPassword, targetUsername);
