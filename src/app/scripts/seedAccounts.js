
import { connectToDatabase } from '../../lib/db.js';
import { Account } from '../../lib/models.js';

async function seedAccounts() {
  try {
    console.log('Connecting to database...');
    await connectToDatabase();
    console.log('Connected to database.');

    const seedAccounts = [
      {
        name: "Acme Corp",
        domain: "acme.com",
        industry: "Manufacturing",
      },
      {
        name: "Globex Inc",
        domain: "globex.com",
        industry: "SaaS",
      },
      {
        name: "Initech",
        domain: "initech.io",
        industry: "Technology",
      },
      {
        name: "Umbrella Health",
        domain: "umbrellahealth.org",
        industry: "Healthcare",
      },
    ];

    const created = [];
    const skipped = [];

    for (const acc of seedAccounts) {

      const existing = await Account.findOne({ domain: acc.domain }).exec();
      if (existing) {
        skipped.push(acc.domain);
        console.log(`Account with domain ${acc.domain} already exists. Skipping...`);
      } else {
        const newAccount = await Account.create(acc);
        created.push(newAccount);
        console.log(`w Created account: ${newAccount.name} (${newAccount.domain})`);
      }
    }

    console.log('\n Summary:');
    console.log(`Created: ${created.length} account(s)`);
    console.log(`Skipped: ${skipped.length} account(s) (already exist)`);
    
    if (created.length > 0) {
      console.log('\nCreated accounts:');
      created.forEach((acc) => {
        console.log(`  - ${acc.name} (${acc.domain}) - ${acc.industry || 'No industry'}`);
      });
    }

    if (skipped.length > 0) {
      console.log('\nSkipped (already exist):');
      skipped.forEach((domain) => {
        console.log(`  - ${domain}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error(' Error seeding accounts:', error);
    process.exit(1);
  }
}

// Run the script
seedAccounts();

