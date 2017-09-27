# 3R New Faces

Show the faces of your most newly-added volunteers in a full-screen experience,
to help your team meet one another.

# Requirements

* A _Three Rings_ account with access to the Directory.
* A _Three Rings_ API key (get this by clicking "API Keys" from your Directory
page).
* [NodeJS](https://nodejs.org/)

# Installation

Check out the code or download as a ZIP file.

Run `npm install` to install the dependencies.

# Usage

Run `npm start` to run the application. On first run, you will be asked for
your API key. Only a valid API key that provides access to the Directory will
be accepted.

3R New Faces will connect to your Directory and get the details of all "new"
volunteers (here defined as: those who were created during the same calendar
month as the calendar month in which the most-recent were created). These will
probably be those from the latest intake of volunteers, depending on your
recruitment strategy. It will download photos of each volunteer (this may take
a minute) and will then display a slideshow of their photos, captioned with
their name.

The photos are cached to the 'faces' directory in the application folder; you
can delete it to clear the cache. The API key is saved to your home folder
(on Windows this will be the AppData folder).

# License/development

This work is released under the GPL: you're free to run, study, share and
modify the software, but if you redistribute it then you must also license it
under the same license terms. You could use it as a learning project or a
starting if you're hoping to implement a client to the
[Three Rings API](https://www.3r.org.uk/api). And if you get stuck,
[get in touch](https://www.threerings.org.uk/contact/) and we might be able to
give you some pointers.
