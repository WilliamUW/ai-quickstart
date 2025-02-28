import { createAgent } from './agent/createAgent.js';

async function main() {
  try {
    console.log('🤖 Initializing AI Agent...');
    const agent = await createAgent();

    // Example 1: Generate verifiable text
    console.log('\n📝 Generating verifiable text...');
    const prompt = 'What is the capital of France?';
    const textResult = await agent.generateVerifiableText(prompt, "0x0000000000000000000000000000000000000000");
    console.log('Response:', textResult.content);
    console.log('Proof available:', !!textResult.proof);

    // Example 2: Log custom information
    console.log('\n📊 Logging custom information...');
    await agent.logInfo('Demo Completed', {
      timestamp: new Date().toISOString(),
      status: 'success'
    });

    console.log('\n✅ Demo completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main(); 