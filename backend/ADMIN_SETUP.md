# Initial admin setup

Public registration supports only Student and Instructor. Admin creation is a local command, never a public endpoint.

In backend/.env, set ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD. Use an email you control and a unique password of at least 12 characters (maximum 72 UTF-8 bytes). Do not commit this file or paste the password into chat.

Run from the repository root:

    npm --prefix backend run create-admin

The script loads backend/.env regardless of the working directory, uses the existing User password hash hook, and never prints the password. Repeating it does not reset credentials or create a duplicate. It refuses to promote an existing non-admin account or reactivate a deleted account.

Log in through /login with those credentials. Open /admin (also /admin/dashboard), then Instructor Requests. Open an application to download private documents and approve, reject or request changes. A reason is required for rejection and changes. Only complete, email-verified, pending applications can be approved.

Remove ADMIN_PASSWORD from the environment after provisioning if it is no longer needed; the stored account remains usable. Keep your chosen credentials in your password manager.
