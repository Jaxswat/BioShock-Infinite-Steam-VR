
const flipMap = {
	// Elizabeth
    "CharacterWorldSpaceTM": "CharacterWorldSpaceTM",
    "Scene_Root": "Scene_Root",
    "GenericHumanRoot": "GenericHumanRoot",
    "GenericHumanPelvis": "GenericHumanPelvis",
    "GenericHumanDressBone_FR1": "GenericHumanDressBone_FL1",
    "GenericHumanDressBone_FR2": "GenericHumanDressBone_FL2",
    "GenericHumanDressBone_FR3": "GenericHumanDressBone_FL3",
    "GenericHumanDressBone_FR4": "GenericHumanDressBone_FL4",
    "GenericHumanDressBone_FR5": "GenericHumanDressBone_FL5",
    "GenericHumanDressBone_R1": "GenericHumanDressBone_L1",
    "GenericHumanDressBone_R2": "GenericHumanDressBone_L2",
    "GenericHumanDressBone_R3": "GenericHumanDressBone_L3",
    "GenericHumanDressBone_L1": "GenericHumanDressBone_R1",
    "GenericHumanDressBone_L2": "GenericHumanDressBone_R2",
    "GenericHumanDressBone_L3": "GenericHumanDressBone_R3",
    "GenericHumanDressBone_BL1": "GenericHumanDressBone_BR1",
    "GenericHumanDressBone_BL2": "GenericHumanDressBone_BR2",
    "GenericHumanDressBone_BL3": "GenericHumanDressBone_BR3",
    "GenericHumanDressBone_BR1": "GenericHumanDressBone_BL1",
    "GenericHumanDressBone_BR2": "GenericHumanDressBone_BL2",
    "GenericHumanDressBone_BR3": "GenericHumanDressBone_BL3",
    "GenericHumanDressBone_FL1": "GenericHumanDressBone_FR1",
    "GenericHumanDressBone_FL2": "GenericHumanDressBone_FR2",
    "GenericHumanDressBone_FL3": "GenericHumanDressBone_FR3",
    "GenericHumanDressBone_FL4": "GenericHumanDressBone_FR4",
    "GenericHumanDressBone_FL5": "GenericHumanDressBone_FR5",
    "GenericHumanLThigh": "GenericHumanRThigh",
    "GenericHumanLCalf": "GenericHumanRCalf",
    "GenericHumanLFoot": "GenericHumanRFoot",
    "GenericHumanLToe1": "GenericHumanRToe1",
    "GenericHumanRThigh": "GenericHumanLThigh",
    "GenericHumanRCalf": "GenericHumanLCalf",
    "GenericHumanRFoot": "GenericHumanLFoot",
    "GenericHumanRToe1": "GenericHumanLToe1",
    "GenericHumanSpine1": "GenericHumanSpine1",
    "GenericHumanSpine2": "GenericHumanSpine2",
    "GenericHumanSpine3": "GenericHumanSpine3",
    "GenericHumanRibcage": "GenericHumanRibcage",
    "GenericHumanBreathingBone": "GenericHumanBreathingBone",
    "GenericHumanLCollarbone": "GenericHumanRCollarbone",
    "GenericHumanLUpperarm1": "GenericHumanRUpperarm1",
    "GenericHumanLUpperarm2": "GenericHumanRUpperarm2",
    "GenericHumanLForearm1": "GenericHumanRForearm1",
    "GenericHumanLForearm2": "GenericHumanRForearm2",
    "GenericHumanLPalm": "GenericHumanRPalm",
    "L_Grip": "R_Grip",
    "GenericHumanLDigit11": "GenericHumanRDigit11",
    "GenericHumanLDigit12": "GenericHumanRDigit12",
    "GenericHumanLDigit13": "GenericHumanRDigit13",
    "GenericHumanLDigit21": "GenericHumanRDigit21",
    "GenericHumanLDigit22": "GenericHumanRDigit22",
    "GenericHumanLDigit23": "GenericHumanRDigit23",
    "GenericHumanLDigit31": "GenericHumanRDigit31",
    "GenericHumanLDigit32": "GenericHumanRDigit32",
    "GenericHumanLDigit33": "GenericHumanRDigit33",
    "GenericHumanLDigit41": "GenericHumanRDigit41",
    "GenericHumanLDigit42": "GenericHumanRDigit42",
    "GenericHumanLDigit43": "GenericHumanRDigit43",
    "GenericHumanLDigit51": "GenericHumanRDigit51",
    "GenericHumanLDigit52": "GenericHumanRDigit52",
    "GenericHumanLDigit53": "GenericHumanRDigit53",
    "GenericHumanRCollarbone": "GenericHumanLCollarbone",
    "GenericHumanRUpperarm1": "GenericHumanLUpperarm1",
    "GenericHumanRUpperarm2": "GenericHumanLUpperarm2",
    "GenericHumanRForearm1": "GenericHumanLForearm1",
    "GenericHumanRForearm2": "GenericHumanLForearm2",
    "GenericHumanRPalm": "GenericHumanLPalm",
    "R_Grip": "L_Grip",
    "GenericHumanRDigit11": "GenericHumanLDigit11",
    "GenericHumanRDigit12": "GenericHumanLDigit12",
    "GenericHumanRDigit13": "GenericHumanLDigit13",
    "GenericHumanRDigit21": "GenericHumanLDigit21",
    "GenericHumanRDigit22": "GenericHumanLDigit22",
    "GenericHumanRDigit23": "GenericHumanLDigit23",
    "GenericHumanRDigit31": "GenericHumanLDigit31",
    "GenericHumanRDigit32": "GenericHumanLDigit32",
    "GenericHumanRDigit33": "GenericHumanLDigit33",
    "GenericHumanRDigit41": "GenericHumanLDigit41",
    "GenericHumanRDigit42": "GenericHumanLDigit42",
    "GenericHumanRDigit43": "GenericHumanLDigit43",
    "GenericHumanRDigit51": "GenericHumanLDigit51",
    "GenericHumanRDigit52": "GenericHumanLDigit52",
    "GenericHumanRDigit53": "GenericHumanLDigit53",
    "GenericHumanNeck": "GenericHumanNeck",
    "GenericHumanHead": "GenericHumanHead",
    "GenericHumanDummyHead": "GenericHumanDummyHead",
    "GenericHuman_LSquint": "GenericHuman_RSquint",
    "GenericHuman_l_browCJnt": "GenericHuman_r_browCJnt",
    "GenericHuman_r_browBJnt": "GenericHuman_l_browBJnt",
    "GenericHuman_c_uppLipJnt": "GenericHuman_c_uppLipJnt",
    "GenericHuman_l_browBJnt": "GenericHuman_r_browBJnt",
    "GenericHuman_l_uppLipJnt": "GenericHuman_r_uppLipJnt",
    "GenericHuman_l_cornerLipJnt": "GenericHuman_r_cornerLipJnt",
    "GenericHuman_r_loCheekJnt": "GenericHuman_l_loCheekJnt",
    "GenericHuman_l_loCheekJnt": "GenericHuman_r_loCheekJnt",
    "GenericHuman_C_jawJnt": "GenericHuman_C_jawJnt",
    "GenericHuman_C_chinJnt": "GenericHuman_C_chinJnt",
    "GenericHuman_r_loLipJnt": "GenericHuman_l_loLipJnt",
    "GenericHuman_c_loLipJnt": "GenericHuman_c_loLipJnt",
    "GenericHuman_l_loLipJnt": "GenericHuman_r_loLipJnt",
    "GenericHuman_C_tongue_a_Jnt": "GenericHuman_C_tongue_a_Jnt",
    "GenericHuman_C_tongue_b_Jnt": "GenericHuman_C_tongue_b_Jnt",
    "GenericHuman_l_nostrilJnt": "GenericHuman_r_nostrilJnt",
    "GenericHuman_r_uppCheekJnt": "GenericHuman_l_uppCheekJnt",
    "GenericHuman_r_nostrilJnt": "GenericHuman_l_nostrilJnt",
    "GenericHuman_l_uppCheekJnt": "GenericHuman_r_uppCheekJnt",
    "GenericHuman_l_uppLidJnt": "GenericHuman_r_uppLidJnt",
    "GenericHuman_l_loLidJnt": "GenericHuman_r_loLidJnt",
    "GenericHuman_r_loLidJnt": "GenericHuman_l_loLidJnt",
    "GenericHuman_r_uppLidJnt": "GenericHuman_l_uppLidJnt",
    "GenericHuman_l_EyeJnt": "GenericHuman_r_EyeJnt",
    "GenericHuman_r_browCJnt": "GenericHuman_l_browCJnt",
    "GenericHuman_r_browAJnt": "GenericHuman_l_browAJnt",
    "GenericHuman_l_browAJnt": "GenericHuman_r_browAJnt",
    "GenericHuman_C_forehead": "GenericHuman_C_forehead",
    "GenericHuman_RSquint": "GenericHuman_LSquint",
    "GenericHuman_R_InnerCheek": "GenericHuman_L_InnerCheek",
    "GenericHuman_L_InnerCheek": "GenericHuman_R_InnerCheek",
    "GenericHuman_r_EyeJnt": "GenericHuman_l_EyeJnt",
    "GenericHuman_r_uppLipJnt": "GenericHuman_l_uppLipJnt",
    "GenericHuman_r_cornerLipJnt": "GenericHuman_l_cornerLipJnt",
    "GenericHuman_BackHair01": "GenericHuman_BackHair01",
    "GenericHuman_BackHair02": "GenericHuman_BackHair02",
    "GenericHuman_PonyTail01": "GenericHuman_PonyTail01",
    "GenericHuman_PonyTail02": "GenericHuman_PonyTail02",
    "GenericHuman_PonyTail03": "GenericHuman_PonyTail03",
    "GenericHuman_LHair01": "GenericHuman_RHair01",
    "GenericHuman_LHair02": "GenericHuman_RHair02",
    "GenericHuman_RHair01": "GenericHuman_LHair01",
    "GenericHuman_RHair02": "GenericHuman_LHair02",
    "GenericHuman_RFaceHair01": "GenericHuman_LFaceHair01",
    "GenericHuman_RFaceHair02": "GenericHuman_LFaceHair02",
    "GenericHuman_LFaceHair01": "GenericHuman_RFaceHair01",
    "GenericHuman_LFaceHair02": "GenericHuman_RFaceHair02",
    "GenericHuman_FrontHair01": "GenericHuman_FrontHair01",
    "GenericHuman_FrontHair02": "GenericHuman_FrontHair02",
    "TrajectoryBone": "TrajectoryBone",
	
	// idk, other chumps
	"GenMaleRoot": "GenMaleRoot",
	"GenericHumanPelvis_offset": "GenericHumanPelvis_offset",
	"Back_Grip": "Back_Grip",
	"GenericHumanLFoot_IKTarget": "GenericHumanRFoot_IKTarget",
	"GenericHumanRFoot_IKTarget": "GenericHumanLFoot_IKTarget",
	"GenericHumanLPalm_IKTarget": "GenericHumanRFoot_IKTarget",
	"GenericHumanRPalm_IKTarget": "GenericHumanLFoot_IKTarget",
	"GenericHumanLUpperarm": "GenericHumanRUpperarm",
	"GenericHumanRUpperarm": "GenericHumanLUpperarm",
	"GenericHumanLPalm_WpnIKTarget": "GenericHumanRPalm_WpnIKTarget",
	"GenericHumanRPalm_WpnIKTarget": "GenericHumanLPalm_WpnIKTarget",
	
	// idk, skyhook
	"Particle_View_01": "Particle_View_01",
	"HookPARENT": "HookPARENT",
	"Bone_Body": "Bone_Body",
	"Bone_BodyGear": "Bone_BodyGear",
	"Bone_HookParent": "Bone_HookParent",
	"Bone_ROT": "Bone_ROT",
	"Bone_Hook3": "Bone_Hook3",
	"Bone_Hook1": "Bone_Hook1",
	"Bone_Hook2": "Bone_Hook2",
	"Bone_HookGear": "Bone_HookGear",
}

const fs = require('fs');

const FILE_DATA = fs.readFileSync(process.argv[2], "utf8")
const LINE_SPLIT = "\n"
const lines = FILE_DATA.split(LINE_SPLIT)

const updatedLines = [];
for (let lineIndex in lines) {
    const line = lines[lineIndex].trim()
    const lineParts = line.split(' ')

    // flip bone names
    if (lineParts.length > 1 && lineParts[1].startsWith('"')) {
        const currentName = lineParts[1].substring(1, lineParts[1].length - 1)
        const flipName = flipMap[currentName]
		if (!flipName) {
			throw new Error("unmapped flip name: " + currentName)
		}
		
        lineParts[1] = "\"" + flipName + "\""

        updatedLines.push(lineParts.join(' '))
        continue
    }

    // flip and scale coords/rot
    const scaleFactor = 0.01
    if (lineParts.length == 9) {
        const x = Number(lineParts[2]) * scaleFactor
        const y = Number(lineParts[3]) * scaleFactor
        const z = Number(lineParts[4]) * scaleFactor
        const rx = Number(lineParts[6])
        const ry = Number(lineParts[7])
        const rz = Number(lineParts[8])

        lineParts[2] = (x).toFixed(6)
        lineParts[3] = (y).toFixed(6)
        lineParts[4] = (z).toFixed(6)
		
		lineParts[6] = (rx+Math.PI).toFixed(6)
        lineParts[7] = (ry).toFixed(6)
        lineParts[8] = (rz).toFixed(6)

        updatedLines.push(lineParts.join(' '))
        continue
    }

    // irrelevant lines
    updatedLines.push(line)
}

fs.writeFileSync(process.argv[2].substring(0,process.argv[2].length-4)+"_corrected.smd",updatedLines.join(LINE_SPLIT), 'utf8')
