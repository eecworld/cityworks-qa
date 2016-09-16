# Cityworks Quality Assurance Plugin

Version 1.3.0

Quality assurance tools for [Cityworks Server](http://www.cityworks.com/) that validate data entry when it happens

![Screenshot: Work Order with QA Plugin](doc/cw-qa-wo-screenshot.png)

Ensuring quality data entry is key to any Cityworks deployment.
But if data isn't validated when it's entered (especially from the field), problems are often found too late to fix.
These tools allow Cityworks administrators to add extra checks and controls to the forms in Cityworks to ensure that users are entering high quality data.

These tools were originally developed by [EEC](http://www.eecenvironmental.com) for the [City of Sacramento's Department of Utilities](http://portal.cityofsacramento.org/Utilities) Cityworks installation.
If you have any issues, feel free to contact EEC.  The City loves you too, but they're busy running a whole city and EEC has resources dedicated to support this so you're much better off bugging EEC.

## Setup

The following instructions should hopefully help you to get the QA plugin up and running.
If you encounter any issues, feel free to contact Steve Shaffer at EEC (sshaffer@eecenvironmental.com) for help or if you have questions.

### Installation

Copy the entire contents of this project to a web-accessible location on the host server where Cityworks is installed.

[Click here](https://codeload.github.com/eecworld/cityworks-qa/zip/master) to download the current release in a zip archive.

If git is installed on the destination machine, the following command can be used to deploy the project with git:

    git clone https://github.com/eecworld/cityworks-qa.git

If you run the above command in wwwroot or deploy the tool to wwwroot\cityworks-qa, all the default parameters should run correctly.
If not, you'll need to re-map some of the parameters in the XML.

### Configuration

The tool can be configured two ways: inside Cityworks and outside Cityworks.
The latter doesn't make too much sense currently, so the former (inside) is the best way to deploy.

#### Option 1: Deploy / Edit XML Files

The tool can be injected and configured through Cityworks XML customization.  Example .xml files are included in the Xml directory in this project.
If you don't already have any XML configuration, you can deploy this file directly into an XML folder per Cityworks instructions.
If you have existing Cityworks XML configurations for the WOGeneral, SRGeneral, and/or CustomFields pages, you can probably just copy and paste everything between the <layout> tags to the end of the <layout> section in your existing WOGeneral.xml, SRGeneral.xml, and CustomFields.xml files.

See the provided XML file for notes on where to make configuration changes.
The main changes are made in the SCRIPTS INJECTION section.

#### Option 2: EEC Cityworks Plugin Architecture

This repository is a valid EEC Cityworks Plugin.
If you are using the EEC Cityworks Plugin loader, you'll need to copy the tool to the "modules" directory and add "cityworks-qa" to the list of modules in your configuration.

The options that are available for this plugin are as follows:

* applyToAllMessage: A message to be shown when "Apply to All" is checked (since the QA plugin doesn't run when the form is in "Apply to All" mode)
* statuses: A list of statuses to refuse when all tests have not been met
* tests: A list of the tests that should be run

These can be set on both the "workorder" and "request" options nodes as in the following example:

    # This example is shown in YAML, but the corresponding JSON would also work
    modules:
    - id: cityworks-qa
      options:
        workorder:
          tests:
          - labor
          - tasks
        request:
          tests:
          - labor

### A Note on CustomFields.xml

This is a note explaining why the code stub in CustomFields.xml is necessary.
If you simply deploy what's in CustomFields.xml file, you don't need to worry about this; this is merely a technical explanation as to why that code exists.

Because the custom fields .xml configuration is outside the scope of either the work order or service request .xml configuration, it gets loaded after the QA plugin that's loaded in each of those pages.
As a result, required custom fields are ignored since they don't exist at the time the QA plugin is initialized.
To remedy this, the following code should be run in a location in the .xml after the custom fields have been loaded:

    eecQaPlugin.update()

This will update the existing counts to account for any required custom fields that have since been loaded.
This will happen so fast that the initial count (which didn't take custom fields into account) won't even be seen by the user.

## Compatibility

This tool has been tested to work with the following versions of Cityworks Server:

 * Cityworks Server 2013 (SP2 and SP4)
 * Cityworks Server 2014

## Contributing

There are a number of ways to get involved if you'd like to contribute to this project.  See below!

### Reporting Issues

If you encounter a bug or think of a great new feature you'd like to see added, go ahead and [file an issue](https://github.com/eecworld/cityworks-qa/issues/new) on the GitHub repository.
Please be nice and try to be as detailed as possible ;)

### Testing

If you've deployed this tool in a particular version of Cityworks that's not listed in the "Compatibility" section above, please send along the results of your deployment so we can update our compatibility.

### Code

Want to contribute actual lines of code to this project?
Great!  Just fork this repository and submit a Pull Request on GitHub.

And if that's not your standard workflow, feel free to just send your contributions along to Steve Shaffer @ EEC (sshaffer@eecenvironmental.com).

----------

## Special Thanks

Special thanks to the City of Sacramento's Department of Utilities for making this tool possible, shaping the initial development, and supporting its release to the Cityworks community.

Thanks also to all the hardworking folks at [Cityworks](http://www.cityworks.com/) for their dedication to building an extensible platform for awesome GIS-centric public asset management!
