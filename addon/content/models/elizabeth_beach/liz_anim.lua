DoIncludeScript( "animation/sequence_functions/sequence_functions", getfenv(1) )

---------------------------- liz stuff

model:CreatePoseParameter( "head_pitch", -30, 30, 0, false )
model:CreatePoseParameter( "head_yaw", -60, 60, 0, false )
PoseMatrixFromSequence( { model = model, name = "head_look_seq", pose_x = "head_pitch", pose_y = "head_yaw", subtract = "head_look", subtractframe = 4, source = "head_look", hidden = false, autoplay = true, righttoleft = true } )

model:CreatePoseParameter( "eyes_pitch", -42, 48, 0, false )
model:CreatePoseParameter( "eyes_yaw", -50, 50, 0, false )
PoseMatrixFromSequence( { model = model, name = "eyes_look_seq", pose_x = "eyes_pitch", pose_y = "eyes_yaw", subtract = "eyes_look", subtractframe = 4, source = "eyes_look", hidden = false, autoplay = true, righttoleft = true } )

model:CreatePoseParameter( "face_smile", 0, 1, 0, false )
PoseMatrixFromSequence( { model = model, name = "face_smile_seq", pose_x = "face_smile", source = "smile", subtract = "smile", subtractframe = 0, hidden = false, numrows = 1, numcolumns = 2, autoplay = true, righttoleft = true } )

model:CreatePoseParameter( "face_blink", 0, 1, 0, false )
PoseMatrixFromSequence( { model = model, name = "face_blink_seq", pose_x = "face_blink", source = "blink", subtract = "blink", subtractframe = 0, hidden = false, numrows = 1, numcolumns = 2, autoplay = true, righttoleft = true } )

model:CreatePoseParameter( "face_speak", 0, 1, 0, false )
PoseMatrixFromSequence( { model = model, name = "face_speak_seq", pose_x = "face_speak", source = "speak", subtract = "speak", subtractframe = 0, hidden = false, numrows = 1, numcolumns = 2, autoplay = true, righttoleft = true } )

print("BUILT ELIZABETH ANIMS")
