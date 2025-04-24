/**
 * Models module - Handles data parsing and management
 */

// Global state for models data
const ModelStore = {
    manifestData: null,
    models: {},
    currentModel: null,

    /**
     * Parse the manifest JSON
     * @param {string} jsonString - The manifest.json content as string
     */
    parseManifest(jsonString) {
        this.manifestData = JSON.parse(jsonString);
        this.models = {};

        // Extract models from manifest
        const nodes = this.manifestData.nodes || {};

        Object.keys(nodes).forEach(nodeId => {
            const node = nodes[nodeId];
            if (node.resource_type === 'model') {
                this.models[nodeId] = node;
            }
        });

        return this.models;
    },

    /**
     * Get all models as an array sorted by name
     * @param {string} filterText - Optional text to filter models by name
     * @returns {Array} - Sorted array of model objects
     */
    getSortedModels(filterText = '') {
        const sortedModels = Object.values(this.models)
            .sort((a, b) => a.name.localeCompare(b.name));

        if (!filterText) {
            return sortedModels;
        }

        return sortedModels.filter(model =>
            model.name.toLowerCase().includes(filterText.toLowerCase()));
    },

    /**
     * Set current model
     * @param {Object} model - The model to set as current
     */
    setCurrentModel(model) {
        this.currentModel = model;
    },

    /**
     * Get current column description
     * @param {string} columnName - Column name
     * @returns {string} - Current description or empty string
     */
    getCurrentColumnDescription(columnName) {
        if (this.currentModel &&
            this.currentModel.columns &&
            this.currentModel.columns[columnName]) {
            return this.currentModel.columns[columnName].description || '';
        }
        return '';
    },

    /**
     * Update column description
     * @param {string} columnName - Name of the column to update
     * @param {string} description - New description
     * @returns {boolean} - Success status
     */
    updateColumnDescription(columnName, description) {
        if (this.currentModel &&
            this.currentModel.columns &&
            this.currentModel.columns[columnName]) {

            this.currentModel.columns[columnName].description = description;

            // Also update in the models collection
            const modelId = Object.keys(this.models).find(
                id => this.models[id].name === this.currentModel.name
            );

            if (modelId) {
                this.models[modelId].columns[columnName].description = description;
            }

            return true;
        }
        return false;
    },

    /**
     * Get updated manifest data
     * @returns {Object} - The updated manifest data
     */
    getUpdatedManifest() {
        if (!this.manifestData) return null;

        // Update the manifest data with our changes
        Object.keys(this.models).forEach(modelId => {
            this.manifestData.nodes[modelId] = this.models[modelId];
        });

        return this.manifestData;
    }
};