/**
 * Description Editor - Handles editing of individual column descriptions
 */
const DescriptionEditor = {
    // Store revision history for current session
    revisions: [],

    /**
     * Initialize the description editor
     */
    initialize() {
        // Set up event listeners for the description editor modal
        document.getElementById('generateRevision').addEventListener('click', () => this.generateRevision());
        document.getElementById('saveBtn').addEventListener('click', () => this.saveDescription());

        // Add event delegation for revision actions
        document.getElementById('revisionsTable').addEventListener('click', (e) => {
            if (e.target && e.target.classList.contains('apply-revision')) {
                const index = parseInt(e.target.getAttribute('data-index'));
                this.applyRevision(index);
            } else if (e.target && e.target.classList.contains('edit-revision')) {
                const index = parseInt(e.target.getAttribute('data-index'));
                this.editRevision(index);
            }
        });
    },

    /**
     * Open description editor
     * @param {string} columnName - Column name
     * @param {string} description - Current description
     * @param {string} modelName - Model name
     * @param {string} modelDescription - Model description
     */
    openEditor(columnName, description, modelName, modelDescription) {
        // Clear revisions history
        this.revisions = [];

        // Set modal content
        document.getElementById('columnNameDisplay').textContent = columnName;
        document.getElementById('tableInfoDisplay').textContent = `Table: ${modelName}\n${modelDescription}`;
        document.getElementById('currentDescriptionDisplay').textContent = description || 'No description';
        document.getElementById('latestDescription').value = description || '';
        document.getElementById('businessContext').value = UI.businessContext || '';

        // Clear revisions table
        document.getElementById('revisionsTable').querySelector('tbody').innerHTML = '';

        // Add current description as first revision if it exists
        if (description) {
            this.revisions.push({
                description: description,
                source: 'Original'
            });
            this.renderRevisions();
        }

        // Store column name for later use
        document.getElementById('descriptionModal').setAttribute('data-column', columnName);

        // Show modal
        ModalManager.showModal('descriptionModal');
    },
    //     const columnName = document.getElementById('descriptionModal').getAttribute('data-column');
    //     const modelName = ModelStore.currentModel.name;
    //     const modelDescription = ModelStore.currentModel.description || '';
    //     const businessContext = document.getElementById('businessContext').value;
    //     const currentDescription = document.getElementById('currentDescriptionDisplay').textContent;

    //     // Save business context for reuse
    //     UI.businessContext = businessContext;

    //     // Show loading indicator in the latest description field
    //     document.getElementById('latestDescription').value = 'Generating...';

    //     // Call OpenAI API
    //     OpenAIService.generateRefinedDescription(columnName, modelName, modelDescription, businessContext, currentDescription, '')
    //         .then(description => {
    //             // Update latest description field
    //             document.getElementById('latestDescription').value = description;

    //             // Add to revisions history
    //             this.revisions.push({
    //                 description: description,
    //                 source: 'Initial Generation'
    //             });

    //             // Update revisions list
    //             this.renderRevisions();
    //         })
    //         .catch(error => {
    //             // Show error
    //             document.getElementById('latestDescription').value = 'Error: ' + (error.message || 'Failed to generate description');
    //         });
    // },

    /**
     * Generate a new revision based on user feedback
     */
    generateRevision() {
        const columnName = document.getElementById('descriptionModal').getAttribute('data-column');
        const modelName = ModelStore.currentModel.name;
        const modelDescription = ModelStore.currentModel.description || '';
        const businessContext = document.getElementById('businessContext').value;
        const currentDescription = document.getElementById('currentDescriptionDisplay').textContent;

        // Save business context for reuse
        UI.businessContext = businessContext;

        const feedbackInput = document.getElementById('userFeedback');
        const feedback = feedbackInput.value.trim();

        if (!feedback) return;

        // Clear input
        feedbackInput.value = '';

        // Show loading indicator in the latest description field
        document.getElementById('latestDescription').value = 'Generating...';

        // Call OpenAI API
        OpenAIService.generateRefinedDescription(columnName, modelName, modelDescription, businessContext, currentDescription, feedback)
            .then(response => {
                let descriptionsObject =  JSON.parse(response);
                const revision = descriptionsObject[columnName]

                // Update latest description field
                document.getElementById('latestDescription').value = revision;

                // Add to revisions history
                this.revisions.push({
                    description: revision,
                    source: 'Revision',
                    context: feedback
                });

                // Update revisions list
                this.renderRevisions();
            })
            .catch(error => {
                // Show error
                document.getElementById('latestDescription').value = 'Error: ' + (error.message || 'Failed to process your request');
            });
    },

    /**
     * Render revisions in the table
     */
    renderRevisions() {
        const tbody = document.getElementById('revisionsTable').querySelector('tbody');
        tbody.innerHTML = '';

        this.revisions.forEach((revision, index) => {
            const tr = document.createElement('tr');
            tr.className = 'border-b hover:bg-gray-50';

            // Create description text with shortened display
            const fullDesc = revision.description;
            const shortDesc = fullDesc.length > 100 ? fullDesc.slice(0, 100) + '...' : fullDesc;

            tr.innerHTML = `
                <td class="p-2">${index + 1}</td>
                <td class="p-2">
                    <div class="text-sm">
                        <div class="font-medium">${revision.source}</div>
                        <div class="text-gray-600">${shortDesc}</div>
                        ${revision.context ? `<div class="text-xs text-gray-500 italic mt-1">Context: ${revision.context}</div>` : ''}
                    </div>
                </td>
                <td class="p-2">
                    <div class="flex space-x-2">
                        <button class="apply-revision px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700" data-index="${index}">
                            Apply
                        </button>
                        <button class="edit-revision px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700" data-index="${index}">
                            Edit
                        </button>
                    </div>
                </td>
            `;

            tbody.appendChild(tr);
        });
    },

    /**
     * Apply a revision
     * @param {number} index - Index of the revision to apply
     */
    applyRevision(index) {
        if (index >= 0 && index < this.revisions.length) {
            document.getElementById('latestDescription').value = this.revisions[index].description;
        }
    },

    /**
     * Edit a revision
     * @param {number} index - Index of the revision to edit
     */
    editRevision(index) {
        if (index >= 0 && index < this.revisions.length) {
            const description = this.revisions[index].description;
            document.getElementById('latestDescription').value = description;

            // Focus on the latest description field for editing
            document.getElementById('latestDescription').focus();
        }
    },

    /**
     * Save the final description
     */
    saveDescription() {
        const columnName = document.getElementById('descriptionModal').getAttribute('data-column');
        const description = document.getElementById('latestDescription').value;

        // Update description in model store
        if (ModelStore.updateColumnDescription(columnName, description)) {
            // Close modal
            ModalManager.closeModal('descriptionModal');

            // Re-render model details to show updated description
            UI.renderModelDetails(ModelStore.currentModel);
        }
    }
};