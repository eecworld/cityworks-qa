## Setup

### Custom Code

Copy the entire contents of this project to a web-accessible location on the host server where Cityworks is intalled.
If git is installed on the destination machine, the following command can be used to deploy the project with git:

    git clone https://watchstevedrum@bitbucket.org/watchstevedrum/sacdou-cityworks-qa-plugin.git

If you run the above command in wwwroot or deploy the tool to wwwroot\sacdou-cityworks-qa-plugin, all the default parameters should run correctly.
If not, you'll need to re-map some of the parameters in the XML.

### Proxy User

You'll need to create a user in Cityworks who has view permissions (but nothing else) to all things you'll need to test.
It should be an employee, in at least one group (probably only one group, like a system group or something), and be authorized and registered on Cityworks Server with a password.
It doesn't need to be part of any server groups, have any inbox or XML configuration, employee relates, or anything like that.

### XML

The tool is injected and configured through Cityworks XML customization.  An example WOGeneral.xml file is included in the Xml directory in this project.
If you don't already have any XML configuration, you can deploy this file directly into an XML folder per Cityworks instructions.
If you have an existing Cityworks XML configuration for the WOGeneral page, you can probably just copy and paste everything between the <layout> tags to the end of the <layout> section in your existing WOGeneral.xml file.

See the provided XML file for notes on where to make configuration changes.
The main changes are made in the SCRIPTS INJECTION section.
