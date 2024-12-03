fetch('../assets/files/contributions.json') // Adjust path if necessary
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    // Check if data is in the expected format
    const calendar = data.data.user.contributionsCollection.contributionCalendar;

    if (!calendar || !calendar.weeks) {
      console.error('Invalid data structure');
      return;
    }

    // Get the graph container
    const graph = document.getElementById('graph');
    graph.style.display = 'flex';
    graph.style.flexDirection = 'row';  // Stack months vertically

    // Create a container for the month labels and the graph
    const header = document.createElement('div');
    header.className = 'header';
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';  // Space out month labels

    const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const daysOfWeekContainer = document.createElement('div');
    daysOfWeekContainer.className = 'days-of-week';
    daysOfWeekContainer.style.display = 'flex';
    daysOfWeekContainer.style.flexDirection = 'column';
    daysOfWeekContainer.style.alignItems = 'initial';
    daysOfWeekContainer.style.justifyContent = 'center';

    // Add weekday labels
    weekdayLabels.forEach(day => {
      const dayLabel = document.createElement('div');
      dayLabel.className = 'weekday-label';
      dayLabel.textContent = day;
      daysOfWeekContainer.appendChild(dayLabel);
    });

    graph.appendChild(daysOfWeekContainer);  // Add weekday labels to the graph

    // Loop through each month (we'll split the data into 12 months)
    let currentMonth = 0;
    for (let i = 0; i < calendar.weeks.length; i += 4) {  // Assuming 4 weeks per month
      const monthDiv = document.createElement('div');
      monthDiv.className = 'month';
      monthDiv.style.display = 'flex';
      monthDiv.style.flexDirection = 'column';
      monthDiv.style.alignItems = 'center';
      monthDiv.style.gap = '10px';

      const monthLabel = document.createElement('div');
      monthLabel.className = 'month-label';
      monthLabel.textContent = getMonthName(currentMonth);
      monthDiv.appendChild(monthLabel);

      const weekContainer = document.createElement('div');
      weekContainer.className = 'week-container';
      weekContainer.style.display = 'flex';

      // Loop through 4 weeks for each month (this assumes 4 weeks per month)
      for (let j = i; j < i + 4 && j < calendar.weeks.length; j++) {
        const weekDiv = document.createElement('div');
        weekDiv.className = 'week';
        weekDiv.style.display = 'flex';
        weekDiv.style.flexDirection = 'column';
        weekDiv.style.gap = '2px';

        // Loop through each day in the week
        calendar.weeks[j].contributionDays.forEach(day => {
          const dayDiv = document.createElement('div');
          dayDiv.className = 'day';
          dayDiv.style.backgroundColor = getColorForContributions(day.contributionCount);
          dayDiv.title = `${day.date}: ${day.contributionCount} contributions`;
          weekDiv.appendChild(dayDiv);
        });

        weekContainer.appendChild(weekDiv);
      }

      monthDiv.appendChild(weekContainer);
      graph.appendChild(monthDiv);
      currentMonth++;
    }

    // Add the header with month labels to the graph
    graph.prepend(header);
  })
  .catch(error => {
    console.error('Error loading contributions:', error);
  });

// Function to convert month index to name
function getMonthName(index) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[index];
}

// Function to return a color based on the number of contributions
function getColorForContributions(contributionCount) {
  // Create a gradient scale from light to dark
  const colorScale = [
    '#ebedf0', // No contributions
    '#c6e48b', // Less contributions
    '#7bc96f', // Moderate contributions
    '#239a3b', // More contributions
    '#196127'  // Maximum contributions
  ];
  
  // Decide which color based on contribution count (arbitrary scale)
  if (contributionCount === 0) return colorScale[0];
  if (contributionCount <= 5) return colorScale[1];
  if (contributionCount <= 10) return colorScale[2];
  if (contributionCount <= 15) return colorScale[3];
  return colorScale[4];  // For higher contributions
}
