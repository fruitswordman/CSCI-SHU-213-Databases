document.querySelectorAll('.sidebar ul li').forEach(function (li) {
    li.addEventListener('click', function (e) {
        showPanel(e, li);
    });
});

function showPanel(e, li) {
    // Remove active class from all list items
    document.querySelectorAll('.sidebar ul li').forEach(function (item) {
        item.classList.remove('active');
    });

    // Hide all content panels
    document.querySelectorAll('.content-panel').forEach(function (panel) {
        panel.classList.remove('active');
    });

    // Add active class to clicked list item
    li.classList.add('active');

    // Get the ID of the panel to show
    const panelId = li.getAttribute('data-panelid');
    const activePanel = document.getElementById(panelId);

    // Show the selected panel
    if (activePanel) {
        activePanel.classList.add('active');
    }
}