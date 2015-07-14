(function(CbnForm) {
	
	/**
	 * Defines the abstract interface to be implemented by the custom file input elements.
	 * 
	 * @extends CbnForm.AbstractInput
	 */
	CbnForm.AbstractFileInput = [CbnForm.AbstractInput, { 
		
		/**
		 * Returns an array with the files selected using the input.
		 * Used by the primary form component to send the uploaded files via AJAX.
		 * 
		 * @return {[File]} A list of File objects for each selected file.
		 */
		getFiles: function () {
			throw "Not implemented!";
		}
		
	}];
	
})(CbnForm);
