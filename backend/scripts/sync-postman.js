require('dotenv').config(); 

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const apiKey = process.env.POSTMAN_API_KEY;
const workspaceId = process.env.POSTMAN_WORKSPACE_ID;
const collectionName = 'ZapFood Admin Restaurant API';

if (!apiKey) {
  console.error('❌ POSTMAN_API_KEY não configurada!');
  process.exit(1);
}

if (!workspaceId) {
  console.error('❌ POSTMAN_WORKSPACE_ID não configurada!');
  process.exit(1);
}

const config = {
  headers: {
    'X-Api-Key': apiKey,
    'Content-Type': 'application/json',
  },
};

async function syncCollection() {
  try {
    console.log('\n📦 Sincronizando Collection...');
    console.log('━'.repeat(50));

    const collectionPath = path.join(
      __dirname,
      '../docs/postman-collections.json',
    );

    if (!fs.existsSync(collectionPath)) {
      console.log(
        '⚠️  Arquivo postman-collections.json não encontrado. Pulando...',
      );
      return;
    }

    const collectionDefinition = JSON.parse(
      fs.readFileSync(collectionPath, 'utf8'),
    );

    const { data } = await axios.get(
      'https://api.postman.com/collections',
      config,
    );
    const existing = data.collections.find((c) => c.name === collectionName);

    const payload = {
      collection: {
        ...collectionDefinition,
        info: {
          ...collectionDefinition.info,
          name: collectionName,
        },
      },
    };

    if (existing) {
      console.log(`📝 Atualizando collection "${collectionName}"...`);
      await axios.put(
        `https://api.postman.com/collections/${existing.uid}`,
        payload,
        config,
      );
      console.log(`✅ Collection atualizada com sucesso!`);
      console.log(`   ID: ${existing.uid}`);
    } else {
      console.log(`➕ Criando nova collection "${collectionName}"...`);
      const response = await axios.post(
        `https://api.postman.com/collections?workspace=${workspaceId}`,
        payload,
        config,
      );
      console.log(`✅ Collection criada com sucesso!`);
      console.log(`   ID: ${response.data.collection.id}`);
    }
  } catch (error) {
    console.error('❌ Erro ao sincronizar collection:');
    console.error(error.response?.data || error.message);
    throw error;
  }
}

async function syncEnvironments() {
  try {
    console.log('\n🌍 Sincronizando Environments...');
    console.log('━'.repeat(50));

    const docsDir = path.join(__dirname, '../docs');
    const candidates = [
      'postman-env.local.json',
      'postman-env.dev.json',
      'postman-env.prod.json',
    ];

    const files = candidates
      .map((f) => path.join(docsDir, f))
      .filter((full) => fs.existsSync(full));

    if (files.length === 0) {
      console.log(
        '⚠️  Nenhum arquivo de environment encontrado em docs/. Pulando...',
      );
      return;
    }

    // Cache de environments existentes para reduzir chamadas
    const { data } = await axios.get(
      'https://api.postman.com/environments',
      config,
    );
    const existingList = data.environments || [];

    for (const envPath of files) {
      const envDefinition = JSON.parse(fs.readFileSync(envPath, 'utf8'));
      const environmentName = envDefinition.name;

      const existing = existingList.find((env) => env.name === environmentName);

      const payload = {
        environment: {
          name: environmentName,
          values: envDefinition.values,
        },
      };

      if (existing) {
        console.log(`📝 Atualizando environment "${environmentName}"...`);
        await axios.put(
          `https://api.postman.com/environments/${existing.uid}`,
          payload,
          config,
        );
        console.log(`✅ Environment atualizado!`);
        console.log(`   ID: ${existing.uid}`);
      } else {
        console.log(`➕ Criando environment "${environmentName}"...`);
        const response = await axios.post(
          `https://api.postman.com/environments?workspace=${workspaceId}`,
          payload,
          config,
        );
        console.log(`✅ Environment criado!`);
        console.log(`   ID: ${response.data.environment.id}`);
      }
    }
  } catch (error) {
    console.error('❌ Erro ao sincronizar environments:');
    console.error(error.response?.data || error.message);
    throw error;
  }
}

async function main() {
  console.log('\n🚀 Iniciando sincronização com Postman');
  console.log('═'.repeat(50));

  const startTime = Date.now();

  try {
    await syncCollection();
    await syncEnvironments();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n' + '═'.repeat(50));
    console.log(`🎉 Sincronização completa em ${duration}s!`);
    console.log('═'.repeat(50) + '\n');
  } catch (error) {
    console.error('\n' + '═'.repeat(50));
    console.error('💥 Falha na sincronização!');
    console.error('═'.repeat(50) + '\n');
    process.exit(1);
  }
}

main();