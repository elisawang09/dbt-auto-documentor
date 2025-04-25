/**
 * Batch Generator - Handles batch generation of descriptions
 */
const BatchGenerator = {
    /**
     * Initialize batch generator
     */
    initialize() {
        // Set up event listener for batch generation
        document.getElementById('startGenerationBtn').addEventListener('click', () => this.startBatchGeneration());
    },

    /**
     * Open batch description modal
     */
    openModal() {
        const model = ModelStore.currentModel;

        // Set modal content
        document.getElementById('batchModelName').textContent = model.name;
        document.getElementById('batchModelDescription').textContent = model.description || 'No description provided';
        document.getElementById('tableDescription').value = model.description || '';
        document.getElementById('batchBusinessContext').value = UI.businessContext || '';

        // Hide progress section
        document.getElementById('batchProgress').classList.add('hidden');

        // Show modal
        ModalManager.showModal('batchModal');
    },

    /**
     * Start batch generation of descriptions
     */
    async startBatchGeneration() {
        const model = ModelStore.currentModel;
        const columns = model.columns || {};
        const columnsWithoutDescription = Object.values(columns).filter(column => !column.description);

        if (columnsWithoutDescription.length === 0) {
            alert('All columns already have descriptions.');
            ModalManager.closeModal('batchModal');
            return;
        }

        // Get user input
        const tableDescription = document.getElementById('tableDescription').value.trim();
        const businessContext = document.getElementById('batchBusinessContext').value.trim();

        // Save business context for reuse
        UI.businessContext = businessContext;

        // Update model description if provided
        if (tableDescription && tableDescription !== model.description) {
            ModelStore.updateModelDescription(tableDescription);
        }

        // Show progress section
        const progressCounter = document.getElementById('progressCounter');
        const progressBar = document.getElementById('progressBar');
        progressCounter.textContent = `0/${columnsWithoutDescription.length}`;
        progressBar.style.width = '0%';
        document.getElementById('batchProgress').classList.remove('hidden');

        // Disable buttons
        document.getElementById('startGenerationBtn').disabled = true;
        document.getElementById('startGenerationBtn').classList.add('opacity-50');
        document.getElementById('cancelBatchBtn').disabled = true;
        document.getElementById('cancelBatchBtn').classList.add('opacity-50');

        try {
            // Extract column names for the request
            const columnNames = columnsWithoutDescription.map(column => column.name);

            // Generate descriptions for all columns in a single request
            const response = await OpenAIService.generateDescription(
                columnNames,
                model.name,
                tableDescription || model.description || '',
                businessContext,
                ''
            );

            // Parse the JSON response
            let descriptionsObject;
            try {
                // Try to parse the response directly
                descriptionsObject = JSON.parse(response);
            } catch (parseError) {
                // If direct parsing fails, try to extract JSON from the text
                const jsonMatch = response.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    descriptionsObject = JSON.parse(jsonMatch[0]);
                } else {
                    throw new Error('Could not parse the AI response as JSON');
                }
            }

            // Update column descriptions from the response
            let completedCount = 0;

            for (const column of columnsWithoutDescription) {
                if (descriptionsObject[column.name]) {
                    // Update column description
                    ModelStore.updateColumnDescription(column.name, descriptionsObject[column.name]);

                    // Update progress
                    completedCount++;
                    progressCounter.textContent = `${completedCount}/${columnsWithoutDescription.length}`;
                    progressBar.style.width = `${(completedCount / columnsWithoutDescription.length) * 100}%`;
                }
            }

            // Re-render model details to show updated descriptions
            UI.renderModelDetails(ModelStore.currentModel);

            // Close modal after a short delay
            setTimeout(() => {
                ModalManager.closeModal('batchModal');
                alert('All descriptions generated successfully!');
            }, 1000);
        } catch (error) {
            alert(`Error generating descriptions: ${error.message}`);

            // Re-enable buttons
            document.getElementById('startGenerationBtn').disabled = false;
            document.getElementById('startGenerationBtn').classList.remove('opacity-50');
            document.getElementById('cancelBatchBtn').disabled = false;
            document.getElementById('cancelBatchBtn').classList.remove('opacity-50');
        }
    }
};
