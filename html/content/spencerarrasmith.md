# Maximum recursion depth exceeded
After years of domain squatting, I began work on this website in May, 2026. The goal was to roll my own structure which is minimalist, visually appealing, and could be expanded over time to highlight new career steps and showcase new projects.

## Technology
### Javascript
The code for this site was created with the help of Claude, and will be refined and refactored over time as the site matures. Javascript is used to render the header bar, the filter bar, the project tiles, and the project pages themselves. The only external dependency is Marked.js, a lightweight Markdown to HTML renderer.

### Content
Based on my prior experience with static site generators, I wanted to leverage the ease of writing Markdown for the website content without the overhead of things like a built-in webserver or templated home page. Marked.js seems to provide the perfect middle ground for me.

### Deployment
This website is version controlled on Github, and is packaged as a standalone container based on `nginx:stable-alpine3.23-perl`. When a new tag is created on Github, Actions trigger which build the container then push it to the Github container registry. Upon updating the registry, a webhook notifies the DigitalOcean droplet, hitting a custom listener which pulls the updated container, stops the currently running version, and brings up the new one.

### Networking
Because the DigitalOcean droplet is home to a handful of other static sites, Caddy is configured as a reverse proxy. Each running nginx container (such as this site) binds its http port to a unique port on localhost, and the DNS reverse proxy is handled seamlessly by Caddy.