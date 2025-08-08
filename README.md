# Program Area Contacts Tool

This project provides a simple web interface for Health Canada analysts to keep track of key program area contacts. The site is designed to be hosted on GitHub Pages.

## Features

- Password protected access (default password: `healthpass`).
- View, search, add, and edit contact records.
- Each contact can include branch, department/agency, name, title, division, email, policy topic tags, and communication preferences.
- Tags enable easy filtering by policy area.
- "Email" button generates a draft email in Microsoft Outlook (or the default mail client) with **to** and **cc** fields pre-filled according to contact preferences.
- Editing requires the user to provide their name, which is stored along with the last modification date.
- Contact data is stored in the browser's `localStorage` after first load from `contacts.json`.

## Usage

1. Serve the site via GitHub Pages or any static file host.
2. Navigate to the page and enter the password.
3. Use the interface to search, add, or edit contacts. Changes are saved in your browser.

> **Note:** This implementation uses client-side password verification and local storage. For sensitive information or multi-user persistence, a secure server-side solution is recommended.

## Development

Contacts are initialized from `contacts.json`. Updates made in the interface are stored locally in the browser. To share updates with others, export the data from local storage and commit changes to `contacts.json` in the repository.

