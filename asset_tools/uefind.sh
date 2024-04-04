#contentRoot="D:/SteamLibrary/steamapps/common/BioShock Infinite/DLC/DLCA/CookedPCConsole_FR" # DLCA
contentRoot="D:/SteamLibrary/steamapps/common/BioShock Infinite/XGame/CookedPCConsole_FR" # XGame

# wildcard = hello.*world

# keyword="Mesh.*TBar" # tranist bar, skylines

keyword="Mesh.*light"

for fName in `ls "$contentRoot" | grep .xxx`
do
	results=`./umodel_64.exe -list "$contentRoot/$fName" | grep -Pi "$keyword"`
	
	if [ -z "$results" ]
	then
		# not found
		test
	else
		echo "		$fName"
		./umodel_64.exe -list "$contentRoot/$fName" | grep -Pi "$keyword"
		echo
	fi
done

# S_DCOM_SecurityFoyer.xxx Statue_Liz
