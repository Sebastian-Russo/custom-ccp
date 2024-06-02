
echo '{ "ccp_init": { "ccpUrl": "", "loginUrl": "", "region": "", "loginPopup": false, "pageOptions": { "enableAudioDeviceSettings": true }}, "api": "", "version": "1.0.0" }' > config-${stage}.json

echo $(cat config-${stage}.json | jq --arg CCPURL "test" '.ccp_init["ccpUrl"] = $CCPURL') > config-${stage}.json
echo $(cat config-${stage}.json | jq --arg LOGINURL "test" '.ccp_init["loginUrl"] = $LOGINURL') > config-${stage}.json
echo $(cat config-${stage}.json | jq --arg REGOIN "test" '.ccp_init["region"] = $REGOIN') > config-${stage}.json
echo $(cat config-${stage}.json | jq --arg API "test" '.ccp_init["api"] = $API') > config-${stage}.json

mv config-${stage}.json ./src

## Bash Commands:

# echo => Prints text to terminal window

# --arg => name value
    # This option passes a value to the jq program as a predefined variable.
    # If you run jq with --arg foo bar, then $foo is available in the program and has the value "bar".
    # Note that value will be treated as a string, so --arg foo 123 will bind $foo to "123".

# cat => Read a file, create a file, and concatenate files
    # cat is one of the more versatile commands and serves three main functions: displaying them, combining copies of them, and creating new ones.
    # Syntax: cat [option(s)] [file_name(s)] [-] [file_name(s)]

# | => takes the standard output of one command and passes it as the input to another.

# TODO .amp_auth ?

# > => redirect stdout
    # The > character is the redirect operator. This takes the output from the preceding command that you’d normally see in the terminal and sends it to a file that you give it.
    # As an example, take echo “contents of file1” > file1. Here it creates a file called file1 and puts the echoed string into it.
