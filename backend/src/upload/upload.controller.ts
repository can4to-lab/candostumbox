// backend/src/upload/upload.controller.ts
import { Controller, Post, UseInterceptors, UploadedFile, UploadedFiles, UseGuards, BadRequestException } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

// Multer (Dosya kaydetme) ayarları
const multerOptions = {
  storage: diskStorage({
    destination: './uploads', 
    filename: (req, file, callback) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      callback(null, `${uniqueSuffix}${ext}`);
    },
  }),
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
      return callback(new BadRequestException('Sadece resim dosyaları yüklenebilir!'), false);
    }
    callback(null, true);
  },
};

@Controller('upload')
export class UploadController {
  
  // 1. TEKLİ YÜKLEME (Kapak Görseli İçin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  @UseInterceptors(FileInterceptor('file', multerOptions))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Dosya bulunamadı.');
    
    const fileUrl = `${process.env.BACKEND_URL || 'http://localhost:3001'}/uploads/${file.filename}`;
    return { url: fileUrl };
  }

  // 2. ÇOKLU YÜKLEME (Galeri İçin - Tek seferde max 10 resim)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('bulk')
  @UseInterceptors(FilesInterceptor('files', 10, multerOptions))
  uploadFiles(@UploadedFiles() files: Array<Express.Multer.File>) {
    if (!files || files.length === 0) throw new BadRequestException('Dosya bulunamadı.');

    const urls = files.map(file => `${process.env.BACKEND_URL || 'http://localhost:3001'}/uploads/${file.filename}`);
    return { urls };
  }
}