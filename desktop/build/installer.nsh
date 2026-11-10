; Smart-Analysis – صفحة الرقم التسلسلي في المُثبّت. الصيغة: SMART-NNNN-CCCC حيث CCCC = (NNNN*7919+1337) mod 10000.
!ifndef BUILD_UNINSTALLER
!include LogicLib.nsh
!include nsDialogs.nsh
Var SerialBox
Function SerialPageCreate
  !insertmacro MUI_HEADER_TEXT "Serial number / الرقم التسلسلي" "Enter the serial number supplied with your copy. / أدخل الرقم التسلسلي المرفق بنسختك."
  nsDialogs::Create 1018
  Pop $0
  ${If} $0 == error
    Abort
  ${EndIf}
  ${NSD_CreateLabel} 0 0 100% 36u "Enter your serial number to continue the installation.$\r$\nSerial format:  SMART-0000-0000$\r$\n$\r$\nأدخل الرقم التسلسلي لمتابعة التثبيت."
  Pop $0
  ${NSD_CreateText} 0 46u 60% 14u ""
  Pop $SerialBox
  SendMessage $SerialBox 197 15 0
  nsDialogs::Show
FunctionEnd
Function SerialPageLeave
  ${NSD_GetText} $SerialBox $0
  StrLen $1 $0
  IntCmp $1 15 0 bad bad
  StrCpy $1 $0 6 0
  StrCmp $1 "SMART-" 0 bad
  StrCpy $1 $0 1 10
  StrCmp $1 "-" 0 bad
  StrCpy $2 $0 4 6
  StrCpy $3 $0 4 11
  IntOp $6 $2 + 0
  StrCmp $6 $2 0 bad
  IntCmp $2 1000 0 bad 0
  IntOp $4 $2 * 7919
  IntOp $4 $4 + 1337
  IntOp $4 $4 % 10000
  StrCmp $4 $3 ok bad
  bad:
    MessageBox MB_ICONEXCLAMATION|MB_OK "Invalid serial number. Please check it and try again.$\r$\nالرقم التسلسلي غير صحيح، راجعه وحاول مرة أخرى."
    Abort
  ok:
  Nop
FunctionEnd
!endif
!macro customWelcomePage
  !insertmacro MUI_PAGE_WELCOME
  Page custom SerialPageCreate SerialPageLeave
!macroend
