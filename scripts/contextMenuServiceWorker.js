const getKey = () => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['openai-key'], (result) => {
            if (result['openai-key']) {
                const decodedKey = atob(result['openai-key']);
                resolve(decodedKey);
            }
        });
    });
};



const generate = async (prompt) => {
    // Get your API key from storage
    const key = await getKey();
    const url = 'https://api.openai.com/v1/completions';
        
    // Call completions endpoint
    const completionResponse = await fetch(url, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
        model: 'text-davinci-002',
        prompt: prompt,
        max_tokens: 650,
        temperature: 0.8,
        }),
    });
        
    // Select the top choice and send back
    const completion = await completionResponse.json();
    return completion.choices.pop();
}
const generateCompletionAction = async (info) => {
    try {
        const { selectionText } = info;
        const basePromptPrefix = `
            Write me a professional LinkdIn message about why I am a good fit as a:
        `
        const baseCompletion = await generate(`${basePromptPrefix}${selectionText}\n`);
        const secondPrompt = `
            Take the message below and refine it to fit in with the top applicants for the following job with similar skills:

            Job and Skills: ${selectionText}

            Message: ${baseCompletion.text}

            Refined Message:
        `
        const secondPromptCompletion = await generate(secondPrompt);
    } catch (err) {
        console.error(err);
    }

};

chrome.contextMenus.create({
    id: "context-run",
    title: "Generate LinkedIn Messages",
    contexts: ['selection']
});

chrome.contextMenus.onClicked.addListener(generateCompletionAction);
