document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const postUrlInput = document.getElementById('post-url');
    const generateBtn = document.getElementById('generate-btn');
    const themeSelect = document.getElementById('theme-select');
    const likesCount = document.getElementById('likes-count');
    const commentsCount = document.getElementById('comments-count');
    const sharesCount = document.getElementById('shares-count');
    const postDate = document.getElementById('post-date');
    const customText = document.getElementById('custom-text');
    const reactionBtns = document.querySelectorAll('.reaction-btn');
    const downloadBtn = document.getElementById('download-btn');
    const sampleBtns = document.querySelectorAll('.sample-btn');
    const postPreview = document.getElementById('post-preview');
    const mainContent = document.querySelector('.main-content');
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // Current post data
    let currentPost = {
        platform: 'twitter',
        username: 'johndoe',
        name: 'John Doe',
        avatar: '',
        content: 'This is a sample post content. Replace this with your own text or generate from a URL.',
        image: '',
        likes: 245,
        comments: 32,
        shares: 12,
        date: '2h ago',
        reaction: 'like'
    };

    // Mock data for different URLs
    const mockPosts = {
        'twitter': {
            'https://twitter.com/elonmusk/status/12345': {
                name: 'Elon Musk',
                username: 'elonmusk',
                content: 'Exciting news about our latest product launch! #Innovation',
                image: 'image/xsample.png',
                likes: '42.5k',
                comments: '3.2k',
                shares: '8.7k',
                date: '5h ago'
            },
            'https://x.com/NASA/status/67890': {
                name: 'NASA',
                username: 'NASA',
                content: 'Beautiful new images from the James Webb Space Telescope reveal never-before-seen details of galaxy formation.',
                image: 'image/xsample.png',
                likes: '125k',
                comments: '8.3k',
                shares: '24.1k',
                date: '1d ago'
            }
        },
        'facebook': {
            'https://facebook.com/NASA/posts/12345': {
                name: 'NASA',
                content: "We're going back to the Moon! Artemis program updates and new discoveries.",
                image: 'image/fb.png',
                likes: '356k',
                comments: '12.4k',
                shares: '45.2k',
                date: '2d ago',
                reaction: 'love'
            },
            'https://fb.com/NationalGeographic/posts/67890': {
                name: 'National Geographic',
                content: 'Rare footage of the snow leopard in its natural habitat. Conservation efforts are making a difference!',
                image: 'image/fb.png',
                likes: '892k',
                comments: '24.7k',
                shares: '56.3k',
                date: '3d ago',
                reaction: 'wow'
            }
        }
    };

    // Initialize the app
    initApp();

    // Event Listeners
    generateBtn.addEventListener('click', generatePost);
    themeSelect.addEventListener('change', updatePostTheme);
    likesCount.addEventListener('input', validateNumberInput);
    commentsCount.addEventListener('input', validateNumberInput);
    sharesCount.addEventListener('input', validateNumberInput);
    postDate.addEventListener('input', updatePostDate);
    customText.addEventListener('input', updatePostContent);
    reactionBtns.forEach(btn => btn.addEventListener('click', updateReaction));
    downloadBtn.addEventListener('click', downloadPostImage);
    sampleBtns.forEach(btn => btn.addEventListener('click', loadSamplePost));
    themeToggle.addEventListener('click', toggleDarkMode);

    // Functions
    function initApp() {
        // Set initial theme
        if (localStorage.getItem('darkMode') === 'enabled') {
            enableDarkMode();
        }
        
        // Validate inputs
        validateNumberInput({ target: likesCount });
        validateNumberInput({ target: commentsCount });
        validateNumberInput({ target: sharesCount });
    }

    function validateNumberInput(e) {
        const input = e.target;
        const value = input.value;
        const regex = /^[0-9.kKmM]+$/;
        
        if (!regex.test(value)) {
            input.value = value.replace(/[^0-9.kKmM]/g, '');
        }
        
        // Update post stats
        updatePostStats();
    }

    async function generatePost() {
        // Show loading state
        postPreview.innerHTML = `
            <div class="loading-message">
                <div class="loading-spinner"></div>
                <p>Generating photo...</p>
            </div>
        `;
        
        // Show main content if hidden
        mainContent.classList.remove('hidden');
        
        const url = postUrlInput.value.trim();
        
        try {
            if (!url) {
                throw new Error("Please enter a URL");
            }
            
            // Determine platform
            let platform = 'twitter';
            if (url.includes('facebook.com') || url.includes('fb.com')) {
                platform = 'facebook';
            }
            
            // Find matching mock data or use default
            let postData = null;
            if (platform === 'twitter') {
                for (const [key, value] of Object.entries(mockPosts.twitter)) {
                    if (url.includes(key.split('/')[2])) { // Check if domain matches
                        postData = value;
                        break;
                    }
                }
            } else {
                for (const [key, value] of Object.entries(mockPosts.facebook)) {
                    if (url.includes(key.split('/')[2])) { // Check if domain matches
                        postData = value;
                        break;
                    }
                }
            }
            
            // Set platform and basic data
            currentPost.platform = platform;
            currentPost.image = platform === 'facebook' ? 'image/fb.png' : 'image/xsample.png';
            
            // Use mock data if found, otherwise use defaults with URL info
            if (postData) {
                currentPost = { ...currentPost, ...postData };
            } else {
                currentPost.name = url.split('/')[3] || "Demo User";
                currentPost.username = url.split('/')[3] || "demouser";
                currentPost.content = `This is a demo post generated from: ${url}`;
            }
            
            // Apply user customizations
            currentPost.likes = likesCount.value || currentPost.likes;
            currentPost.comments = commentsCount.value || currentPost.comments;
            currentPost.shares = sharesCount.value || currentPost.shares;
            currentPost.date = postDate.value || currentPost.date;
            
            if (customText.value) {
                currentPost.content = customText.value;
            }
            
            renderPost();
            
        } catch (error) {
            postPreview.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>${error.message}</p>
                </div>
            `;
            console.error('Error generating post:', error);
        }
    }

    function renderPost() {
        if (currentPost.platform === 'twitter') {
            renderTwitterPost();
        } else {
            renderFacebookPost();
        }
    }

    function renderTwitterPost() {
        const theme = themeSelect.value;
        
        postPreview.className = `twitter-theme ${theme}-mode`;
        postPreview.innerHTML = `
            <div class="twitter-header">
                <div class="twitter-avatar"></div>
                <div class="twitter-user-info">
                    <h3>${currentPost.name}</h3>
                    <p>@${currentPost.username} • ${currentPost.date}</p>
                </div>
            </div>
            <div class="twitter-content">
                ${currentPost.content}
            </div>
            ${currentPost.image ? `<img src="${currentPost.image}" class="twitter-image">` : ''}
            <div class="twitter-stats">
                <div class="twitter-stat">
                    <i class="fas fa-comment"></i> ${currentPost.comments}
                </div>
                <div class="twitter-stat">
                    <i class="fas fa-retweet"></i> ${currentPost.shares}
                </div>
                <div class="twitter-stat">
                    <i class="fas fa-heart"></i> ${currentPost.likes}
                </div>
            </div>
        `;
    }

    function renderFacebookPost() {
        const theme = themeSelect.value;
        
        postPreview.className = `facebook-theme ${theme}-mode`;
        postPreview.innerHTML = `
            <div class="facebook-header">
                <div class="facebook-avatar"></div>
                <div class="twitter-user-info">
                    <h3>${currentPost.name}</h3>
                    <p>${currentPost.date}</p>
                </div>
            </div>
            <div class="facebook-content">
                ${currentPost.content}
            </div>
            ${currentPost.image ? `<img src="${currentPost.image}" class="facebook-image">` : ''}
            <div class="facebook-reactions">
                <div class="facebook-reaction">
                    <img src="reactions/${currentPost.reaction === 'love' ? 'xlove' : currentPost.reaction}.png" alt="${currentPost.reaction}" width="16">
                    ${currentPost.likes}
                </div>
                <div class="facebook-reaction">
                    <i class="fas fa-comment-alt"></i> ${currentPost.comments}
                </div>
                <div class="facebook-reaction">
                    <i class="fas fa-share"></i> ${currentPost.shares}
                </div>
            </div>
        `;
    }

    function updatePostTheme() {
        renderPost();
    }

    function updatePostStats() {
        currentPost.likes = likesCount.value || currentPost.likes;
        currentPost.comments = commentsCount.value || currentPost.comments;
        currentPost.shares = sharesCount.value || currentPost.shares;
        renderPost();
    }

    function updatePostDate() {
        currentPost.date = postDate.value || currentPost.date;
        renderPost();
    }

    function updatePostContent() {
        if (customText.value) {
            currentPost.content = customText.value;
            renderPost();
        }
    }

    function updateReaction(e) {
        const reaction = e.currentTarget.dataset.reaction;
        
        // Update active state
        reactionBtns.forEach(btn => {
            btn.classList.remove('active');
        });
        
        e.currentTarget.classList.add('active');
        currentPost.reaction = reaction;
        renderPost();
    }

    async function downloadPostImage() {
        try {
            // Show loading state
            downloadBtn.innerHTML = '<img src="image/download.png" alt="Download" class="download-icon"> Processing...';
            
            // Generate image
            const dataUrl = await htmlToImage.toPng(postPreview);
            
            // Create download link
            const link = document.createElement('a');
            link.download = `stat2photo-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();
            
            // Reset button after click.
            downloadBtn.innerHTML = '<img src="image/download.png" alt="Download" class="download-icon">';

        } catch (error) {
            console.error('Error generating image:', error);
            alert('Failed to generate image. Please try again.');
            downloadBtn.innerHTML = '<img src="image/download.png" alt="Download" class="download-icon">';
        }
    }

    function loadSamplePost(e) {
        const url = e.currentTarget.dataset.url;
        postUrlInput.value = url;
        
        // Trigger generation
        generatePost();
    }

    function toggleDarkMode() {
        if (body.classList.contains('dark-mode')) {
            disableDarkMode();
        } else {
            enableDarkMode();
        }
    }

    function enableDarkMode() {
        body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'enabled');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        document.querySelector('.app-header h1').style.color = '#ffffff';
    }

    function disableDarkMode() {
        body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'disabled');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        document.querySelector('.app-header h1').style.color = 'var(--primary-color)';
    }
});