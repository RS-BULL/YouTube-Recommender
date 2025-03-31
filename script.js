async function searchVideos() {
    const query = document.getElementById("searchInput").value.trim();
    if (!query) {
      alert("Please enter a search term!");
      return;
    }
  
    const resultsSection = document.getElementById("results");
    resultsSection.innerHTML = `<p style="text-align:center;">Searching...</p>`;
  
    try {
      // Make a request to your Puppeteer server
      const response = await fetch("https://your-app.onrender.com/search?q=" + encodeURIComponent(query));
      const data = await response.json();
  
      if (!Array.isArray(data) || data.length === 0) {
        resultsSection.innerHTML = `<p style="text-align:center;">No videos found!</p>`;
        return;
      }
  
      // Clear existing results
      resultsSection.innerHTML = "";
  
      // Render video cards
      data.forEach(video => {
        const card = document.createElement("div");
        card.classList.add("video-card");
        card.innerHTML = `
          <img src="${video.thumbnail}" alt="Thumbnail">
          <div class="info">
            <h3>${video.title}</h3>
            <p>${video.channel}</p>
          </div>
        `;
        card.onclick = () => window.open(video.link, "_blank");
        resultsSection.appendChild(card);
      });
  
    } catch (error) {
      console.error("Error fetching videos:", error);
      resultsSection.innerHTML = `<p style="text-align:center; color:red;">Failed to load videos.</p>`;
    }
  }
  