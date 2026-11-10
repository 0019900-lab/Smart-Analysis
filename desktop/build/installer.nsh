; Smart-Analysis - serial number page. Serial: SMART-NNNN-CCCC where CCCC = (NNNN*7919+1337) mod 10000.
; Everything that needs MUI2 lives inside the macro (it is expanded after MUI2 is loaded).
!include LogicLib.nsh
!include nsDialogs.nsh
!ifndef BUILD_UNINSTALLER
Var SerialBox
!endif
!macro customWelcomePage
  !insertmacro MUI_PAGE_WELCOME
  Function SerialPageCreate
    !insertmacro MUI_HEADER_TEXT "Serial number / الرقم التسلسلي" "Enter the serial number supplied with your copy."
    nsDialogs::Create 1018
    Pop $0
    ${If} $0 == error
      Abort
    ${EndIf}
    ${NSD_CreateLabel} 0 0 100% 36u "Enter your serial number to continue the installation.$\r$\nFormat:  SMART-0000-0000$\r$\n$\r$\nأدخل الرقم التسلسلي لمتابعة التثبيت."
    Pop $0
    ${NSD_CreateText} 0 46u 60% 14u ""
    Pop $SerialBox
    SendMessage $SerialBox 197 15 0
    nsDialogs::Show
  FunctionEnd
  Function SerialPageLeave
    ${NSD_GetText} $SerialBox $0
    StrLen $1 $0
    IntCmp $1 15 0 sbad sbad
    StrCpy $1 $0 6 0
    StrCmp $1 "SMART-" 0 sbad
    StrCpy $1 $0 1 10
    StrCmp $1 "-" 0 sbad
    StrCpy $2 $0 4 6
    StrCpy $3 $0 4 11
    IntOp $6 $2 + 0
    StrCmp $6 $2 0 sbad
    IntCmp $2 1000 0 sbad 0
    IntOp $4 $2 * 7919
    IntOp $4 $4 + 1337
    IntOp $4 $4 % 10000
    StrCmp $4 $3 sok sbad
    sbad:
      MessageBox MB_ICONEXCLAMATION|MB_OK "Invalid serial number. Please check it and try again.$\r$\nالرقم التسلسلي غير صحيح، راجعه وحاول مرة أخرى."
      Abort
    sok:
    Nop
  FunctionEnd
  Page custom SerialPageCreate SerialPageLeave
!macroend
