Seeders:

- php artisan db:seed --class=Database\Seeders\LargeUsersSeeder
- php artisan db:seed --class=Database\Seeders\LargeOrganizationsSeeder
- php artisan db:seed --class=Database\Seeders\SiteSeeder
- php artisan db:seed --class=Database\Seeders\FieldSeeder

## todo:

### Critical High Priority:
- Add the option make radio buttons toggle switches when it makes sense (e.g., for boolean fields).
- Add the ability to change submit buttons settings (e.g., text, style).
- Add the ability to change field labels and input styles.
- Make sure validation works correctly for all field types.
- Make sure label alignment works for all field types.
- 

### Node Improvements:
- ~~GetVariable  should have a list of fields or the option to create a field.~~
- ~~SetVariable should have the option to choose an existing field to update or a custom variable name (from GetVariable).~~
- ~~ShowForm node should have the option to add html containers between fields.~~
- ShowForm node should have the option to prefill fields with existing data (e.g., from a user profile).
- There needs to be a node to get existing data from a user profile or other source to use in the workflow.
- ShowForm should have an "extract data from submission" option that can plug into an Array node, which can then be used to map data to other nodes.

### Running Flows Improvements:
- Make sure flows run correctly in pages.
- Add the ability to override flow item options from the page level.
- Ensure that flows can handle errors gracefully and provide meaningful feedback to users.
- Prevent Nodes from being connected to incompatible Node types.
- Add logging for flow executions to help with debugging and monitoring.
- Make sure nodes get the input data they expect.
- Optimize flow execution performance for complex workflows.

### General Improvements:
- ~~Change "Instance" to "Site" throughout the application for better clarity.~~
- Add a way to track changes made to workflows, such as a version history or changelog.
- Implement user roles and permissions to control access to different parts of the application.
- Improve the UI/UX of the workflow editor for better usability.
- Optimize database queries for better performance, especially for large datasets.
- Add more comprehensive tests to ensure the stability of the application.
- Enhance documentation to provide clearer guidance on using the application and its features.

- Consider adding localization support for multiple languages.

### Page Improvements:
- Improve the layout and design of the main dashboard for better user experience.
- Add tooltips or help icons to explain various features and options on different pages.
- Make sure flows are displayed correctly in pages.
- Add the ability to override flow item options from the page level.
- Implement pagination or infinite scrolling for pages with a large number of items.
- Ensure that the page editor is intuitive and easy to use for creating and managing pages.
- Add a preview mode to see how the page will look before publishing.
- Optimize loading times for pages with complex layouts or many elements.
- Add analytics to track user interactions and page performance.
- Ensure accessibility standards are met for all pages.
- Refactor code to improve maintainability and readability.
- Add comments and documentation within the codebase for better understanding.
- Implement automated testing for page-related features to ensure functionality.
- Review and update dependencies to ensure compatibility and security.
- Conduct code reviews to identify and address potential issues or improvements.

### Domain Management Improvements:
- Add the ability to associate sites with domains.
- Implement domain verification to ensure ownership.
- Allow setting up custom domains for sites.
- Add SSL certificate management for custom domains.
- Implement automatic domain renewal reminders.
- Add DNS configuration guidance for users setting up custom domains.
- Improve error handling and user feedback for domain-related issues.
- Optimize domain management performance for large numbers of domains.
- Enhance security measures for domain management features.
- Add logging and monitoring for domain-related activities.
- Update documentation to include domain management features and instructions.
- Conduct security audits to identify and address potential vulnerabilities in domain management.
- Implement user roles and permissions specific to domain management.
- Add support for internationalized domain names (IDNs).
- Ensure compliance with relevant regulations and standards for domain management.
- Refactor domain management code for better maintainability and readability.
- Add unit and integration tests for domain management features.
- Review and update third-party libraries used in domain management for security and compatibility.
- Conduct performance testing to identify and optimize bottlenecks in domain management.
- Implement a user-friendly interface for managing domains within the application.

