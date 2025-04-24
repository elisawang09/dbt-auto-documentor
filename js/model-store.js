/**
 * Model Store - Manages data models and state
 */
const ModelStore = {
    // All loaded models
    models: [],
    
    // Currently selected model
    currentModel: null,
    
    /**
     * Get models sorted by name with optional filtering
     * @param {string} filterText - Optional filter text
     * @returns {Array} - Sorted and filtered models
     */
    getSortedModels(filterText = '') {
        const lowerFilterText = filterText.toLowerCase();
        
        return this.models
            .filter(model => {
                if (!filterText) return true;
                return model.name.toLowerCase().includes(lowerFilterText) || 
                       (model.path && model.path.toLowerCase().includes(lowerFilterText));
            })
            .sort((a, b) => a.name.localeCompare(b.name));
    },
    
    /**
     * Set the current model
     * @param {Object} model - The model to set as current
     */
    setCurrentModel(model) {
        this.currentModel = model;
    },
    
    /**
     * Get description for a column in the current model
     * @param {string} columnName - Column name
     * @returns {string} - Column description or empty string
     */
    getCurrentColumnDescription(columnName) {
        if (!this.currentModel || !this.currentModel.columns || !this.currentModel.columns[columnName]) {
            return '';
        }
        
        return this.currentModel.columns[columnName].description || '';
    },
    
    /**
     * Update model description
     * @param {string} description - New description
     * @returns {boolean} - Success state
     */
    updateModelDescription(description) {
        if (!this.currentModel) return false;
        
        this.currentModel.description = description;
        return true;
    },
    
    /**
     * Update column description
     * @param {string} columnName - Column name
     * @param {string} description - New description
     * @returns {boolean} - Success state
     */
    updateColumnDescription(columnName, description) {
        if (!this.currentModel || !this.currentModel.columns || !this.currentModel.columns[columnName]) {
            return false;
        }
        
        this.currentModel.columns[columnName].description = description;
        return true;
    },
    
    /**
     * Load models from a file (placeholder)
     * @param {File} file - The file to load
     * @returns {Promise} - Promise that resolves when loading is complete
     */
    async loadFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    this.models = data.models || [];
                    resolve();
                } catch (error) {
                    reject(new Error('Invalid file format'));
                }
            };
            
            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };
            
            reader.readAsText(file);
        });
    },
    
    /**
     * Export models to JSON
     * @returns {string} - JSON string of all models
     */
    exportToJSON() {
        return JSON.stringify({ models: this.models }, null, 2);
    }
};
