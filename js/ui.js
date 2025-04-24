/**
 * UI module - Core UI rendering functions
 */
const UI = {
    // DOM elements references
    elements: {
        fileInput: null,
        loadingMessage: null,
        initialMessage: null,
        appContent: null,
        modelsList: null,
        modelDetails: null,
        searchInput: null,
        exportButton: null
    },

    // Store business context for reuse (shared across components)
    businessContext: '',

    /**
     * Initialize UI elements
     */
    initialize() {
        // Cache DOM elements
        this.elements = {
            fileInput: document.getElementById('fileInput'),
            loadingMessage: document.getElementById('loadingMessage'),
            initialMessage: document.getElementById('initialMessage'),
            appContent: document.getElementById('appContent'),
            modelsList: document.getElementById('modelsList'),
            modelDetails: document.getElementById('modelDetails'),
            searchInput: document.getElementById('searchInput'),
            exportButton: document.getElementById('exportButton')
        };

        // Set up delegated event listener for edit buttons
        document.addEventListener('click', event => {
            if (event.target.classList.contains('edit-description')) {
                const columnName = event.target.getAttribute('data-column');
                const currentDescription = ModelStore.getCurrentColumnDescription(columnName);
                const modelName = ModelStore.currentModel.name;
                const modelDescription = ModelStore.currentModel.description || '';

                DescriptionEditor.openEditor(columnName, currentDescription, modelName, modelDescription);
            }

            if (event.target.id === 'generateAllDescriptions') {
                BatchGenerator.openModal();
            }
        });
    },

    /**
     * Show loading state
     */
    showLoading() {
        this.elements.initialMessage.classList.add('hidden');
        this.elements.loadingMessage.classList.remove('hidden');
        this.elements.appContent.classList.add('hidden');
    },

    /**
     * Show content area
     */
    showContent() {
        this.elements.loadingMessage.classList.add('hidden');
        this.elements.initialMessage.classList.add('hidden');
        this.elements.appContent.classList.remove('hidden');
    },

    /**
     * Show initial message
     */
    showInitialMessage() {
        this.elements.loadingMessage.classList.add('hidden');
        this.elements.appContent.classList.add('hidden');
        this.elements.initialMessage.classList.remove('hidden');
    },

    /**
     * Render the list of models
     * @param {string} filterText - Optional filter text
     */
    renderModelsList(filterText = '') {
        const modelsList = this.elements.modelsList;
        modelsList.innerHTML = '';

        const sortedModels = ModelStore.getSortedModels(filterText);

        sortedModels.forEach(model => {
            const modelItem = document.createElement('div');
            modelItem.className = 'model-card p-3 rounded hover:bg-gray-100 cursor-pointer';
            modelItem.innerHTML = `
                <div class="font-medium text-blue-600">${model.name}</div>
                <div class="text-xs text-gray-500 truncate">${model.path}</div>
            `;

            modelItem.addEventListener('click', () => {
                ModelStore.setCurrentModel(model);
                this.renderModelDetails(model);

                // Highlight selected model
                document.querySelectorAll('.model-card').forEach(el => {
                    el.classList.remove('bg-blue-50');
                });
                modelItem.classList.add('bg-blue-50');
            });

            modelsList.appendChild(modelItem);
        });
    },

    /**
     * Check if any column lacks a description
     * @param {Object} columns - The columns object
     * @returns {boolean} - True if any column lacks a description
     */
    hasColumnsWithoutDescription(columns) {
        return Object.values(columns).some(column => !column.description);
    },

    /**
     * Render model details
     * @param {Object} model - The model to render
     */
    renderModelDetails(model) {
        const columns = model.columns || {};
        const columnKeys = Object.keys(columns);
        const hasEmptyDescriptions = this.hasColumnsWithoutDescription(columns);

        this.elements.modelDetails.innerHTML = `
            <div class="mb-8">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h2 class="text-2xl font-bold text-gray-800">${model.name}</h2>
                        <div class="text-sm text-gray-500 mb-2">${model.original_file_path}</div>
                    </div>
                    <div>
                        ${model.tags && model.tags.length > 0 ?
                            model.tags.map(tag => `<span class="tag bg-blue-100 text-blue-800 mr-1">${tag}</span>`).join('') : ''}
                    </div>
                </div>

                <div class="mb-6">
                    <h3 class="text-lg font-semibold mb-2">Description</h3>
                    <div class="border rounded-md p-3 bg-gray-50">
                        ${model.description || '<span class="text-gray-400 italic">No description provided</span>'}
                    </div>
                </div>
            </div>

            <div>
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold">Columns (${columnKeys.length})</h3>
                    ${hasEmptyDescriptions ?
                      `<button id="generateAllDescriptions" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                          Generate All Descriptions
                       </button>` : ''}
                </div>
                ${columnKeys.length === 0 ?
                    '<div class="text-gray-500 italic">No columns defined</div>' :
                    '<div class="overflow-x-auto">' +
                        this.renderColumnsTable(columns) +
                    '</div>'
                }
            </div>
        `;
    },

    /**
     * Render columns table
     * @param {Object} columns - The columns object
     * @returns {string} - HTML for columns table
     */
    renderColumnsTable(columns) {
        let tableHtml = `
            <table class="min-w-full table-auto border-collapse">
                <thead>
                    <tr class="bg-gray-100 border-b">
                        <th class="text-left p-3">Column Name</th>
                        <th class="text-left p-3">Description</th>
                        <th class="text-left p-3">Data Type</th>
                        <th class="text-left p-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        Object.keys(columns).forEach(columnName => {
            const column = columns[columnName];
            const hasDescription = !!column.description;

            tableHtml += `
                <tr class="border-b hover:bg-gray-50">
                    <td class="p-3 font-medium">${column.name}</td>
                    <td class="p-3 w-1/2">
                        <div class="w-full p-2 bg-gray-50 rounded text-sm min-h-8 border">
                            ${column.description || '<span class="text-gray-400 italic">No description</span>'}
                        </div>
                    </td>
                    <td class="p-3 text-gray-600">${column.data_type || 'Not specified'}</td>
                    <td class="p-3">
                        <button class="edit-description px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 ${!hasDescription ? 'opacity-50 cursor-not-allowed' : ''}"
                            data-column="${column.name}" ${!hasDescription ? 'disabled' : ''}>Edit</button>
                    </td>
                </tr>
            `;
        });

        tableHtml += `
                </tbody>
            </table>
        `;

        return tableHtml;
    }
};
