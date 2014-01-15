# EEC Quality Assurance Plugin for Cityworks Server AMS

## Installation

Copy the entire contents of this project to a web-accessible location on the host server where Cityworks is intalled.
If git is installed on the destination machine, the following command can be used to deploy the project with git:

    git clone https://watchstevedrum@bitbucket.org/watchstevedrum/sacdou-cityworks-qa-plugin.git

If you run the above command in wwwroot or deploy the tool to wwwroot\sacdou-cityworks-qa-plugin, all the default parameters should run correctly.
If not, you'll need to re-map some of the parameters in the XML.

## Configuration

The tool can be configured two ways: inside Cityworks and outside Cityworks.
The latter doesn't make too much sense currently, so the former (inside) is the best way to deploy.

### Option 1: Inside Cityworks: Deploy / Edit XML Files

The tool can be injected and configured through Cityworks XML customization.  Example .xml files are included in the Xml directory in this project.
If you don't already have any XML configuration, you can deploy this file directly into an XML folder per Cityworks instructions.
If you have existing Cityworks XML configurations for the WOGeneral, SRGeneral, and/or CustomFields pages, you can probably just copy and paste everything between the <layout> tags to the end of the <layout> section in your existing WOGeneral.xml, SRGeneral.xml, and CustomFields.xml files.

See the provided XML file for notes on where to make configuration changes.
The main changes are made in the SCRIPTS INJECTION section.

### Option 2: Outside Cityworks: Create a Proxy User

If you are using the tool outside of a Cityworks session, you'll need to create a user in Cityworks who has view permissions (but nothing else) to all things you'll need to test.
It should be an employee, in at least one group (probably only one group, like a system group or something), and be authorized and registered on Cityworks Server with a password.
It doesn't need to be part of any server groups, have any inbox or XML configuration, employee relates, or anything like that.

If you are using the tool inside a Cityworks sesion (i.e. the URL says "/cityworks/Default.aspx" or something similar), you don't need to specify a proxy user.
The current user's credentials will be used to authenticate all calls made by this tool.

## A Note on CustomFields.xml

This is a note explaining why the code stub in CustomFields.xml is necessary.
If you simply deploy what's in CustomFields.xml file, you don't need to worry about this; this is merely a technical explanation as to why that code exists.

Because the custom fields .xml configuration is outside the scope of either the work order or service request .xml configuration, it gets loaded after the QA plugin that's loadedin each of those pages.
As a result, required custom fields are ignored since they don't exist at the time the QA plugin is initialized.
To remedy this, the following code should be run in a location in the .xml after the custom fields have been loaded:

    eecQaPlugin.update()

This will update the existing counts to account for any required custom fields that have since been loaded.
This will happen so fast that the initial count (which didn't take custom fields into account) won't even be seen by the user.
