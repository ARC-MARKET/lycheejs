on open location lychee_url

	set LYCHEEJS_ROOT to POSIX path of ((path to me as text) & "::") & "../../../"
	set sh_command to "cd " & LYCHEEJS_ROOT & "; ./bin/helper.sh " & lychee_url & " > /dev/null 2>&1 &"
	do shell script sh_command
 
end open location
