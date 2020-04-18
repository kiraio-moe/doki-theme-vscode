import * as vscode from 'vscode';
import { getCurrentTheme } from './ThemeManager';
import { performGet } from './RESTClient';
import { installSticker } from './StickerService';
import { DokiTheme } from './DokiTheme';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const fetchRemoteChecksum = async (currentTheme: DokiTheme) => {
  const checkSumInputStream = await performGet('https://doki.assets.acari.io/stickers/vscode/reZero/rem/rem.png.checksum.txt');
  return checkSumInputStream.setEncoding('utf8').read();
};

export const resolveLocalStickerPath = (
  currentTheme: DokiTheme,
  context: vscode.ExtensionContext,
): string => {
  const safeStickerPath = currentTheme.sticker.path.replace('/', path.sep);
  return path.join(context.globalStoragePath, safeStickerPath);
};

export function createChecksum(data: Buffer | string): string {
  return crypto.createHash('md5')
    .update(data)
    .digest('hex');
}

const calculateFileChecksum = (filePath: string): string => {
  const fileRead = fs.readFileSync(filePath);
  return createChecksum(fileRead);
};

const fetchLocalChecksum = async (currentTheme: DokiTheme, context: vscode.ExtensionContext) => {
  const localSticker = resolveLocalStickerPath(currentTheme, context);
  return fs.existsSync(localSticker) ? calculateFileChecksum(localSticker) : 'Not a checksum, bruv.';  
};

export const attemptToUpdateSticker = async (context: vscode.ExtensionContext) => {
  const currentTheme = getCurrentTheme();  
  try {
    const remoteChecksum = await fetchRemoteChecksum(currentTheme);
    const localChecksum = await fetchLocalChecksum(currentTheme, context);
    console.log(remoteChecksum, localChecksum);
    
    if(remoteChecksum !== localChecksum) {
      console.log('sticker is different');
      
      // installSticker(currentTheme, context);
    }    
  } catch(e) {
    console.error('Unable to check for updates', e);
  }
};
