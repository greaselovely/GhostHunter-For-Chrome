// popup.js

// Listen for the document to be loaded
document.addEventListener('DOMContentLoaded', function() {
    // Toggle API settings form
    document.getElementById('settingsButton').addEventListener('click', function() {
        const settingsForm = document.getElementById('apiSettingsForm');
        settingsForm.style.display = settingsForm.style.display === 'none' ? 'block' : 'none';
    });

    // Save API settings
    document.getElementById('saveSettings').addEventListener('click', function() {
        const webServerAddress = document.getElementById('webServerAddress').value;
        const apiKey = document.getElementById('apiKeyInput').value;

        // Store the settings in memory (consider using chrome.storage.local for persistence)
        window.apiSettings = { webServerAddress, apiKey };

        // Optionally, hide the settings form and show the upload button
        document.getElementById('apiSettingsForm').style.display = 'none';
        document.getElementById('uploadDomains').style.display = 'block';
    });

    // Upload domains
    document.getElementById('uploadDomains').addEventListener('click', function() {
        const { webServerAddress, apiKey } = window.apiSettings || {};
        if (!webServerAddress || !apiKey) {
            alert('Please save your settings first.');
            return;
        }

        chrome.storage.local.get({ uniqueDomains: [] }, function(result) {
            if (result.uniqueDomains.length) {
                const payload = { fqdn_list: result.uniqueDomains };
                const endpoint = `${webServerAddress}/api/submit_fqdn/`;

                fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify(payload)
                })
                .then(response => response.json())
                .then(data => console.log('Success:', data))
                .catch((error) => console.error('Error:', error));
            }
        });
    });
});



document.addEventListener('DOMContentLoaded', function() {
    chrome.runtime.sendMessage({ message: "getDomainData" }).then(response => {
        const domains = response.data;
        const container = document.getElementById('domain-list');
        container.innerHTML = domains.join('<br>');
        updateCopyButtonState(domains.length === 0);
    });
});

document.getElementById('clearButton').addEventListener('click', function() {
    chrome.runtime.sendMessage({ message: "clearDomainData" }).then(response => {
        if (response.success) {
            document.getElementById('domain-list').textContent = '';
            updateCopyButtonState(true);
        }
    });
});

document.getElementById('copyButton').addEventListener('click', function() {
    const domainList = document.getElementById('domain-list').innerText;
    if (domainList.trim() !== '') {
        navigator.clipboard.writeText(domainList).then(showCopyConfirmation);
    }
});

function updateCopyButtonState(isDisabled) {
    const copyButton = document.getElementById('copyButton');
    copyButton.disabled = isDisabled;
}

function showCopyConfirmation() {
    const confirmation = document.getElementById('copy-confirmation');
    confirmation.style.display = 'inline'; // Show the checkmark
    confirmation.style.opacity = '1'; // Make it fully visible

    setTimeout(() => {
        confirmation.style.opacity = '0'; // Start fading out
        setTimeout(() => {
            confirmation.style.display = 'none'; // Hide after fade out
        }, 600); // Duration of fade out
    }, 2000); // Time to display checkmark before fading
}
