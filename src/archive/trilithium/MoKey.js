MoKey = {
	"None" 					: 0,
	"Cancel" 				: 1,
	"Back" 					: 2,
	"Tab" 					: 3,
	"LineFeed" 				: 4,
	"Clear" 				: 5,
	"Enter" 				: 6,
	"Pause" 				: 7,
	"CapsLock" 				: 8,
	"Escape" 				: 9,
	"Space" 				: 10,
	"PageUp" 				: 11,
	"PageDown" 				: 12,
	"Next" 					: 13,
	"End" 					: 14,
	"Home" 					: 15,
	"Left" 					: 16,
	"Up" 					: 17,
	"Right" 				: 18,
	"Down" 					: 19,
	"Select" 				: 20,
	"Print" 				: 21,
	"Execute" 				: 22,
	"PrintScreen" 			: 23,
	"Insert" 				: 24,
	"Delete" 				: 25,
	"Help" 					: 26,
	"D0" 					: 27,
	"D1" 					: 28,
	"D2" 					: 29,
	"D3" 					: 30,
	"D4" 					: 31,
	"D5" 					: 32,
	"D6" 					: 33,
	"D7" 					: 34,
	"D8" 					: 35,
	"D9" 					: 36,
	"A" 					: 37,
	"B" 					: 38,
	"C" 					: 39,
	"D" 					: 40,
	"E" 					: 41,
	"F" 					: 42,
	"G" 					: 43,
	"H" 					: 44,
	"I" 					: 45,
	"J" 					: 46,
	"K" 					: 47,
	"L" 					: 48,
	"M" 					: 49,
	"N" 					: 50,
	"O" 					: 51,
	"P" 					: 52,
	"Q" 					: 53,
	"R" 					: 54,
	"S" 					: 55,
	"T" 					: 56,
	"U" 					: 57,
	"V" 					: 58,
	"W" 					: 59,
	"X" 					: 60,
	"Y" 					: 61,
	"Z" 					: 62,
	"LWin" 					: 63,
	"RWin" 					: 64,
	"Apps" 					: 65,
	"Sleep" 				: 66,
	"NumPad0" 				: 67,
	"NumPad1" 				: 68,
	"NumPad2" 				: 69,
	"NumPad3" 				: 70,
	"NumPad4" 				: 71,
	"NumPad5" 				: 72,
	"NumPad6" 				: 73,
	"NumPad7" 				: 74,
	"NumPad8" 				: 75,
	"NumPad9" 				: 76,
	"Multiply" 				: 77,
	"Add" 					: 78,
	"Separator" 			: 79,
	"Subtract" 				: 80,
	"Decimal" 				: 81,
	"Divide" 				: 82,
	"F1" 					: 83,
	"F2" 					: 84,
	"F3" 					: 85,
	"F4" 					: 86,
	"F5" 					: 87,
	"F6" 					: 88,
	"F7" 					: 89,
	"F8" 					: 90,
	"F9" 					: 91,
	"F10" 					: 92,
	"F11" 					: 93,
	"F12" 					: 94,
	"F13" 					: 95,
	"F14" 					: 96,
	"F15" 					: 97,
	"F16" 					: 98,
	"F17" 					: 99,
	"F18" 					: 100,
	"F19" 					: 101,
	"F20" 					: 102,
	"F21" 					: 103,
	"F22" 					: 104,
	"F23" 					: 105,
	"F24" 					: 106,
	"NumLock" 				: 107,
	"Scroll" 				: 108,
	"LeftShift" 			: 109,
	"RightShift" 			: 110,
	"LeftCtrl" 				: 111,
	"RightCtrl" 			: 112,
	"LeftAlt" 				: 113,
	"RightAlt" 				: 114,
	"BrowserBack" 			: 115,
	"BrowserForward" 		: 116,
	"BrowserRefresh" 		: 117,
	"BrowserStop" 			: 118,
	"BrowserSearch" 		: 119,
	"BrowserFavorites" 		: 120,
	"BrowserHome" 			: 121,
	"VolumeMute" 			: 122,
	"VolumeDown" 			: 123,
	"VolumeUp" 				: 124,
	"MediaNextTrack" 		: 125,
	"MediaPreviousTrack" 	: 126,
	"MediaStop" 			: 127,
	"MediaPlayPause" 		: 128,
	"LaunchMail" 			: 129,
	"SelectMedia" 			: 130,
	"LaunchApplication1" 	: 131,
	"LaunchApplication2" 	: 132,
	"System" 				: 133,
	"CrSel" 				: 134,
	"ExSel" 				: 135,
	"EraseEof" 				: 136,
	"Play" 					: 137,
	"Zoom" 					: 138,
	"SemiColon"				: 139,
	"Comma"					: 140,
	"Period"				: 141,
	"Quote"					: 142,
	"BackQuote"				: 143,
	"Slash"					: 144,
	"BackSlash"				: 145,
	"OpenBracket"			: 146,
	"CloseBracket"			: 147,
	
	fromKeyCode : function(keyCode) {
		switch(keyCode)
		{
			case 3:
				return MoKey.Cancel;
			case 8:
				return MoKey.Back;
			case 9:
				return MoKey.Tab;
			case 12:
				return MoKey.Clear;
			case 13:
				return MoKey.Enter;
			case 16:
			case 160:
				return MoKey.LeftShift;
			case 17:
			case 162:
				return MoKey.LeftCtrl;
			case 18:
			case 164:
				return MoKey.LeftAlt;
			case 19:
				return MoKey.Pause;
			case 20:
				return MoKey.CapsLock;
			case 27:
				return MoKey.Escape;
			case 32:
				return MoKey.Space;
			case 33:
				return MoKey.PageUp;
			case 34:
				return MoKey.PageDown;
			case 35:
				return MoKey.End;
			case 36:
				return MoKey.Home;
			case 37:
				return MoKey.Left;
			case 38:
				return MoKey.Up;
			case 39:
				return MoKey.Right;
			case 40:
				return MoKey.Down;
			case 41:
				return MoKey.Select;
			case 42:
				return MoKey.Print;
			case 43:
				return MoKey.Execute;
			case 44:
				return MoKey.PrintScreen;
			case 45:
				return MoKey.Insert;
			case 46:
				return MoKey.Delete;
			case 47:
				return MoKey.Help;
			case 48:
				return MoKey.D0;
			case 49:
				return MoKey.D1;
			case 50:
				return MoKey.D2;
			case 51:
				return MoKey.D3;
			case 52:
				return MoKey.D4;
			case 53:
				return MoKey.D5;
			case 54:
				return MoKey.D6;
			case 55:
				return MoKey.D7;
			case 56:
				return MoKey.D8;
			case 57:
				return MoKey.D9;
			case 59:
				return MoKey.SemiColon;
			case 65:
				return MoKey.A;
			case 66:
				return MoKey.B;
			case 67:
				return MoKey.C;
			case 68:
				return MoKey.D;
			case 69:
				return MoKey.E;
			case 70:
				return MoKey.F;
			case 71:
				return MoKey.G;
			case 72:
				return MoKey.H;
			case 73:
				return MoKey.I;
			case 74:
				return MoKey.J;
			case 75:
				return MoKey.K;
			case 76:
				return MoKey.L;
			case 77:
				return MoKey.M;
			case 78:
				return MoKey.N;
			case 79:
				return MoKey.O;
			case 80:
				return MoKey.P;
			case 81:
				return MoKey.Q;
			case 82:
				return MoKey.R;
			case 83:
				return MoKey.S;
			case 84:
				return MoKey.T;
			case 85:
				return MoKey.U;
			case 86:
				return MoKey.V;
			case 87:
				return MoKey.W;
			case 88:
				return MoKey.X;
			case 89:
				return MoKey.Y;
			case 90:
				return MoKey.Z;
			case 91:
				return MoKey.LWin;
			case 92:
				return MoKey.RWin;
			case 93:
				return MoKey.Apps;
			case 95:
				return MoKey.Sleep;
			case 96:
				return MoKey.NumPad0;
			case 97:
				return MoKey.NumPad1;
			case 98:
				return MoKey.NumPad2;
			case 99:
				return MoKey.NumPad3;
			case 100:
				return MoKey.NumPad4;
			case 101:
				return MoKey.NumPad5;
			case 102:
				return MoKey.NumPad6;
			case 103:
				return MoKey.NumPad7;
			case 104:
				return MoKey.NumPad8;
			case 105:
				return MoKey.NumPad9;
			case 106:
				return MoKey.Multiply;
			case 107:
				return MoKey.Add;
			case 108:
				return MoKey.Separator;
			case 109:
				return MoKey.Subtract;
			case 110:
				return MoKey.Decimal;
			case 111:
				return MoKey.Divide;
			case 112:
				return MoKey.F1;
			case 113:
				return MoKey.F2;
			case 114:
				return MoKey.F3;
			case 115:
				return MoKey.F4;
			case 116:
				return MoKey.F5;
			case 117:
				return MoKey.F6;
			case 118:
				return MoKey.F7;
			case 119:
				return MoKey.F8;
			case 120:
				return MoKey.F9;
			case 121:
				return MoKey.F10;
			case 122:
				return MoKey.F11;
			case 123:
				return MoKey.F12;
			case 124:
				return MoKey.F13;
			case 125:
				return MoKey.F14;
			case 126:
				return MoKey.F15;
			case 127:
				return MoKey.F16;
			case 128:
				return MoKey.F17;
			case 129:
				return MoKey.F18;
			case 130:
				return MoKey.F19;
			case 131:
				return MoKey.F20;
			case 132:
				return MoKey.F21;
			case 133:
				return MoKey.F22;
			case 134:
				return MoKey.F23;
			case 135:
				return MoKey.F24;
			case 144:
				return MoKey.NumLock;
			case 145:
				return MoKey.Scroll;
			case 161:
				return MoKey.RightShift;
			case 163:
				return MoKey.RightCtrl;
			case 165:
				return MoKey.RightAlt;
			case 166:
				return MoKey.BrowserBack;
			case 167:
				return MoKey.BrowserForward;
			case 168:
				return MoKey.BrowserRefresh;
			case 169:
				return MoKey.BrowserStop;
			case 170:
				return MoKey.BrowserSearch;
			case 171:
				return MoKey.BrowserFavorites;
			case 172:
				return MoKey.BrowserHome;
			case 173:
				return MoKey.VolumeMute;
			case 174:
				return MoKey.VolumeDown;
			case 175:
				return MoKey.VolumeUp;
			case 176:
				return MoKey.MediaNextTrack;
			case 177:
				return MoKey.MediaPreviousTrack;
			case 178:
				return MoKey.MediaStop;
			case 179:
				return MoKey.MediaPlayPause;
			case 180:
				return MoKey.LaunchMail;
			case 181:
				return MoKey.SelectMedia;
			case 182:
				return MoKey.LaunchApplication1;
			case 183:
				return MoKey.LaunchApplication2;
			case 188:
				return MoKey.Comma;
			case 190:
				return MoKey.Period;
			case 191:
				return MoKey.Slash;
			case 192:
				return MoKey.BackQuote;
			case 219:
				return MoKey.OpenBracket;
			case 220:
				return MoKey.BackSlash;
			case 221:
				return MoKey.CloseBracket;
			case 222:
				return MoKey.Quote;
			case 247:
				return MoKey.CrSel;
			case 248:
				return MoKey.ExSel;
			case 249:
				return MoKey.EraseEof;
			case 250:
				return MoKey.Play;
			case 251:
				return MoKey.Zoom;
		}
		
		return MoKey.None;
	},
	
	fromCharCode : function(charCode) {	
		switch(charCode)
		{
			case 48:
				return MoKey.D0;
			case 49:
				return MoKey.D1;
			case 50:
				return MoKey.D2;
			case 51:
				return MoKey.D3;
			case 52:
				return MoKey.D4;
			case 53:
				return MoKey.D5;
			case 54:
				return MoKey.D6;
			case 55:
				return MoKey.D7;
			case 56:
				return MoKey.D8;
			case 57:
				return MoKey.D9;
			case 59:
				return MoKey.SemiColon;
			case 65:
			case 97:
				return MoKey.A;
			case 66:
			case 98:
				return MoKey.B;
			case 67:
			case 99:
				return MoKey.C;
			case 68:
			case 100:
				return MoKey.D;
			case 69:
			case 101:
				return MoKey.E;
			case 70:
			case 102:
				return MoKey.F;
			case 71:
			case 103:
				return MoKey.G;
			case 72:
			case 104:
				return MoKey.H;
			case 73:
			case 105:
				return MoKey.I;
			case 74:
			case 106:
				return MoKey.J;
			case 75:
			case 107:
				return MoKey.K;
			case 76:
			case 108:
				return MoKey.L;
			case 77:
			case 109:
				return MoKey.M;
			case 78:
			case 110:
				return MoKey.N;
			case 79:
			case 111:
				return MoKey.O;
			case 80:
			case 112:
				return MoKey.P;
			case 81:
			case 113:
				return MoKey.Q;
			case 82:
			case 114:
				return MoKey.R;
			case 83:
			case 115:
				return MoKey.S;
			case 84:
			case 116:
				return MoKey.T;
			case 85:
			case 117:
				return MoKey.U;
			case 86:
			case 118:
				return MoKey.V;
			case 87:
			case 119:
				return MoKey.W;
			case 88:
			case 120:
				return MoKey.X;
			case 89:
			case 121:
				return MoKey.Y;
			case 90:
			case 122:
				return MoKey.Z;
			case 42:
				return MoKey.Multiply;
			case 43:
				return MoKey.Add;
			case 124:
				return MoKey.Separator;
			case 45:
				return MoKey.Subtract;
			case 46:
				return MoKey.Period;
			case 47:
				return MoKey.Divide;
			case 44:
				return MoKey.Comma;
			case 96:
				return MoKey.BackQuote;
			case 91:
				return MoKey.OpenBracket;
			case 92:
				return MoKey.BackSlash;
			case 93:
				return MoKey.CloseBracket;
			case 39:
				return MoKey.Quote;
		}
		
		return MoKey.None;
	},
	
	toKeyCode : function(key) {
		switch(key)
		{
			case MoKey.Cancel:
				return 3;
			case MoKey.Back:
				return 8;
			case MoKey.Tab:
				return 9;
			case MoKey.Clear:
				return 12;
			case MoKey.Enter:
				return 13;
			case MoKey.LeftShift:
				return 16;
			case MoKey.LeftCtrl:
				return 17;
			case MoKey.LeftAlt:
				return 18;
			case MoKey.Pause:
				return 19;
			case MoKey.CapsLock:
				return 20;
			case MoKey.Escape:
				return 27;
			case MoKey.Space:
				return 32;
			case MoKey.PageUp:
				return 33;
			case MoKey.PageDown:
				return 34;
			case MoKey.End:
				return 35;
			case MoKey.Home:
				return 36;
			case MoKey.Left:
				return 37;
			case MoKey.Up:
				return 38;
			case MoKey.Right:
				return 39;
			case MoKey.Down:
				return 40;
			case MoKey.Select:
				return 41;
			case MoKey.Print:
				return 42;
			case MoKey.Execute:
				return 43;
			case MoKey.PrintScreen:
				return 44;
			case MoKey.Insert:
				return 45;
			case MoKey.Delete:
				return 46;
			case MoKey.Help:
				return 47;
			case MoKey.D0:
				return 48;
			case MoKey.D1:
				return 49;
			case MoKey.D2:
				return 50;
			case MoKey.D3:
				return 51;
			case MoKey.D4:
				return 52;
			case MoKey.D5:
				return 53;
			case MoKey.D6:
				return 54;
			case MoKey.D7:
				return 55;
			case MoKey.D8:
				return 56;
			case MoKey.D9:
				return 57;
			case MoKey.SemiColon:
				return 59;
			case MoKey.A:
				return 65;
			case MoKey.B:
				return 66;
			case MoKey.C:
				return 67;
			case MoKey.D:
				return 68;
			case MoKey.E:
				return 69;
			case MoKey.F:
				return 70;
			case MoKey.G:
				return 71;
			case MoKey.H:
				return 72;
			case MoKey.I:
				return 73;
			case MoKey.J:
				return 74;
			case MoKey.K:
				return 75;
			case MoKey.L:
				return 76;
			case MoKey.M:
				return 77;
			case MoKey.N:
				return 78;
			case MoKey.O:
				return 79;
			case MoKey.P:
				return 80;
			case MoKey.Q:
				return 81;
			case MoKey.R:
				return 82;
			case MoKey.S:
				return 83;
			case MoKey.T:
				return 84;
			case MoKey.U:
				return 85;
			case MoKey.V:
				return 86;
			case MoKey.W:
				return 87;
			case MoKey.X:
				return 88;
			case MoKey.Y:
				return 89;
			case MoKey.Z:
				return 90;
			case MoKey.LWin:
				return 91;
			case MoKey.RWin:
				return 92;
			case MoKey.Apps:
				return 93;
			case MoKey.Sleep:
				return 95;
			case MoKey.NumPad0:
				return 96;
			case MoKey.NumPad1:
				return 97;
			case MoKey.NumPad2:
				return 98;
			case MoKey.NumPad3:
				return 99;
			case MoKey.NumPad4:
				return 100;
			case MoKey.NumPad5:
				return 101;
			case MoKey.NumPad6:
				return 102;
			case MoKey.NumPad7:
				return 103;
			case MoKey.NumPad8:
				return 104;
			case MoKey.NumPad9:
				return 105;
			case MoKey.Multiply:
				return 106;
			case MoKey.Add:
				return 107;
			case MoKey.Separator:
				return 108;
			case MoKey.Subtract:
				return 109;
			case MoKey.Decimal:
				return 110;
			case MoKey.Divide:
				return 111;
			case MoKey.F1:
				return 112;
			case MoKey.F2:
				return 113;
			case MoKey.F3:
				return 114;
			case MoKey.F4:
				return 115;
			case MoKey.F5:
				return 116;
			case MoKey.F6:
				return 117;
			case MoKey.F7:
				return 118;
			case MoKey.F8:
				return 119;
			case MoKey.F9:
				return 120;
			case MoKey.F10:
				return 121;
			case MoKey.F11:
				return 122;
			case MoKey.F12:
				return 123;
			case MoKey.F13:
				return 124;
			case MoKey.F14:
				return 125;
			case MoKey.F15:
				return 126;
			case MoKey.F16:
				return 127;
			case MoKey.F17:
				return 128;
			case MoKey.F18:
				return 129;
			case MoKey.F19:
				return 130;
			case MoKey.F20:
				return 131;
			case MoKey.F21:
				return 132;
			case MoKey.F22:
				return 133;
			case MoKey.F23:
				return 134;
			case MoKey.F24:
				return 135;
			case MoKey.NumLock:
				return 144;
			case MoKey.Scroll:
				return 145;
			case MoKey.RightShift:
				return 161;
			case MoKey.RightCtrl:
				return 163;
			case MoKey.RightAlt:
				return 165;
			case MoKey.BrowserBack:
				return 166;
			case MoKey.BrowserForward:
				return 167;
			case MoKey.BrowserRefresh:
				return 168;
			case MoKey.BrowserStop:
				return 169;
			case MoKey.BrowserSearch:
				return 170;
			case MoKey.BrowserFavorites:
				return 171;
			case MoKey.BrowserHome:
				return 172;
			case MoKey.VolumeMute:
				return 173;
			case MoKey.VolumeDown:
				return 174;
			case MoKey.VolumeUp:
				return 175;
			case MoKey.MediaNextTrack:
				return 176;
			case MoKey.MediaPreviousTrack:
				return 177;
			case MoKey.MediaStop:
				return 178;
			case MoKey.MediaPlayPause:
				return 179;
			case MoKey.LaunchMail:
				return 180;
			case MoKey.SelectMedia:
				return 181;
			case MoKey.LaunchApplication1:
				return 182;
			case MoKey.LaunchApplication2:
				return 183;
			case MoKey.Comma:
				return 188;
			case MoKey.Period:
				return 190;
			case MoKey.Slash:
				return 191;
			case MoKey.BackQuote:
				return 192;
			case MoKey.OpenBracket:
				return 219;
			case MoKey.BackSlash:
				return 220;
			case MoKey.CloseBracket:
				return 221;
			case MoKey.Quote:
				return 222;
			case MoKey.CrSel:
				return 247;
			case MoKey.ExSel:
				return 248;
			case MoKey.EraseEof:
				return 249;
			case MoKey.Play:
				return 250;
			case MoKey.Zoom:
				return 251;
		}
		
		return 0;
	}
};