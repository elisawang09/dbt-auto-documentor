/**
 * OpenAI Service - Handles communication with OpenAI API
 */

const OpenAIService = {
    // API configuration
    apiKey: null,
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4.1',
    sysMsgContent: `You are an AI assistant specialized in writing clear, concise descriptions for database columns.
Your task is to create high-quality column descriptions based on the column name, table information, and business context provided.
Follow these guidelines:
1. Keep descriptions concise but informative (1-2 sentences) and easy to understand for non-technical users
2. Use professional database documentation language
3. Include information about what the column represents
4. Mention relationships to other data when relevant
5. Note any special formats or constraints if apparent from the name
6. Avoid technical jargon unless necessary for clarity
7. Organize your output to a JSON format {COLUMN_NAME: GENERATED_DESCRIPTION} since it might need to display the result of multiple columns. `,

    // Store conversation history for the current session
    conversationHistory: [],

    /**
     * Initialize the OpenAI service
     * @param {string} apiKey - OpenAI API key
     */
    initialize(apiKey = null) {
        this.apiKey = apiKey ||
                    localStorage.getItem('openai_api_key') ||
                    this.getDefaultApiKey();
        // Reset conversation history
        this.conversationHistory = [];
    },

    /**
     * Get default API key from various sources
     * Returns null if no key is found
     */
    getDefaultApiKey() {
        // Check if there's a global config object (which could be loaded from a separate file)
        if (window.API_CONFIG && window.API_CONFIG.OPENAI_API_KEY) {
            return window.API_CONFIG.OPENAI_API_KEY;
        }

        return null;
    },

    /**
     * Generate description using OpenAI
     * @param {string|string[]} columnName - Column name(s)
     * @param {string} modelName - Model name (table name)
     * @param {string} modelDescription - Model description
     * @param {string} businessContext - Business context
     * @param {string} currentDescription - Current description
     * @returns {Promise<string>} - Generated description
     */
    async generateDescription(columnName, modelName, modelDescription, businessContext, currentDescription) {
        if (!this.apiKey) {
            throw new Error('OpenAI API key is not set. Please set it in the settings.');
        }

        // Reset conversation history for new column
        this.conversationHistory = [];

        // Create system message
        const systemMessage = {
            role: 'system',
            content: this.sysMsgContent
        };

        // Create user message based on whether we have single column or multiple columns
        let userContent;

        if (Array.isArray(columnName)) {
            // Multiple columns case
            userContent = `I need descriptions for the following columns in the table "${modelName}":
    ${columnName.map(name => `- ${name}`).join('\n')}

    ${modelDescription ? `Table description: ${modelDescription}` : ''}
    ${businessContext ? `Business context: ${businessContext}` : ''}

    Please return descriptions for all columns in a JSON format where keys are column names and values are their descriptions:
    {
      "COLUMN_NAME_1": "Generated description for column 1",
      "COLUMN_NAME_2": "Generated description for column 2"
      ... and so on for all columns
    }`;
        } else {
            // Single column case
            userContent = `I need a description for the column "${columnName}" in the table "${modelName}".
    ${modelDescription ? `\nTable description: ${modelDescription}` : ''}
    ${businessContext ? `\nBusiness context: ${businessContext}` : ''}
    ${currentDescription && currentDescription !== 'No description' ? `\nCurrent description: ${currentDescription}` : ''}

    Please return the description in a JSON format:
    {
      "${columnName}": "Generated description"
    }`;
        }

        const userMessage = {
            role: 'user',
            content: userContent
        };

        // Add messages to conversation history
        this.conversationHistory.push(systemMessage);
        this.conversationHistory.push(userMessage);

        try {
            // Call OpenAI API
            const response = await this.callOpenAI(this.conversationHistory);

            // Extract assistant message
            const assistantMessage = response.choices[0].message;

            // Add response to conversation history
            this.conversationHistory.push(assistantMessage);

            return assistantMessage.content;
        } catch (error) {
            console.error('Error generating description:', error);
            throw new Error(error.message || 'Failed to generate description');
        }
    },

    /**
     * Generate refined description with improvement context
     * @param {string} columnName - Column name
     * @param {string} modelName - Model name (table name)
     * @param {string} modelDescription - Model description
     * @param {string} businessContext - Business context
     * @param {string} currentDescription - Current description
     * @param {string} improvementContext - Improvement context
     * @returns {Promise<string>} - Generated refined description
     */
    async generateRefinedDescription(columnName, modelName, modelDescription, businessContext, currentDescription, improvementContext) {
        if (!this.apiKey) {
            throw new Error('OpenAI API key is not set. Please set it in the settings.');
        }

        // Reset conversation history for new column
        this.conversationHistory = [];

        // Create system message
        const systemMessage = {
            role: 'system',
            content: this.sysMsgContent
        };

        // Create user message
        let userContent = `I need ${currentDescription && currentDescription !== 'No description' ? 'an improved' : 'a'} description for the column "${columnName}" in the table "${modelName}".`;

        if (modelDescription) userContent += `\nTable description: ${modelDescription}`;
        if (businessContext) userContent += `\nBusiness context: ${businessContext}`;
        if (currentDescription && currentDescription !== 'No description') userContent += `\nCurrent description: ${currentDescription}`;
        if (improvementContext) userContent += `\nDesired improvements: ${improvementContext}`;

        const userMessage = {
            role: 'user',
            content: userContent
        };

        // Add messages to conversation history
        this.conversationHistory.push(systemMessage);
        this.conversationHistory.push(userMessage);

        try {
            // Call OpenAI API
            const response = await this.callOpenAI(this.conversationHistory);

            // Extract assistant message
            const assistantMessage = response.choices[0].message;

            // Add response to conversation history
            this.conversationHistory.push(assistantMessage);

            return assistantMessage.content;
        } catch (error) {
            console.error('Error generating refined description:', error);
            throw new Error(error.message || 'Failed to generate refined description');
        }
    },

    /**
     * Call OpenAI API
     * @param {Array} messages - Conversation messages
     * @returns {Promise<Object>} - API response
     */
    async callOpenAI(messages) {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: messages,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('OpenAI API call failed:', error);
            throw error;
        }
    },

    /**
     * Get conversation history
     * @returns {Array} - Conversation history
     */
    getConversationHistory() {
        return this.conversationHistory;
    },

    /**
     * Clear conversation history
     */
    clearConversationHistory() {
        this.conversationHistory = [];
    },

    /**
     * Fallback to mock response if API is not available
     * @param {string} columnName - Column name
     * @returns {string} - Mock response
     */
    generateMockResponse(columnName) {
        // This is only used as a fallback if the API call fails
        const commonColumns = {
            id: "Primary key that uniquely identifies this record in the database.",
            created_at: "Timestamp indicating when this record was created in the database.",
            updated_at: "Timestamp indicating when this record was last updated in the database.",
            user_id: "Foreign key referencing the user associated with this record.",
            is_active: "Boolean flag indicating whether this record is currently active."
        };

        if (commonColumns[columnName]) {
            return commonColumns[columnName];
        }

        // Default response based on column name analysis
        if (columnName.includes('_id')) {
            return `Foreign key referencing the ${columnName.replace('_id', '')} associated with this record.`;
        } else if (columnName.includes('_at')) {
            return `Timestamp indicating when the ${columnName.replace('_at', '')} action or event occurred.`;
        } else if (columnName.startsWith('is_') || columnName.startsWith('has_')) {
            return `Boolean flag indicating whether this record ${columnName.replace('is_', '').replace('has_', '').replace('_', ' ')}.`;
        }

        return `Stores information about the ${columnName.replace('_', ' ')} for this record.`;
    }
};