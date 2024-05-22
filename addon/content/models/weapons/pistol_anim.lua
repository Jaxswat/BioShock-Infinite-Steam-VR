DoIncludeScript( "animation/sequence_functions/sequence_functions", getfenv(1) )

model:CreatePoseParameter( "trigger", 0, 1, 0, false )
PoseMatrixFromSequence( { model = model, name = "trigger_seq", pose_x = "trigger", source = "trigger", subtract = "trigger", subtractframe = 0, hidden = false, numrows = 1, numcolumns = 2, autoplay = true, righttoleft = true } )

print("BUILT PISTOL ANIMS")
