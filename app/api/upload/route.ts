import { NextRequest, NextResponse } from 'next/server';
import { put, del } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'لم يتم تحديد ملف' },
        { status: 400 }
      );
    }

    // التحقق من نوع الملف
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'نوع الملف غير مدعوم. يرجى رفع صورة أو PDF أو مستند Word/Excel' },
        { status: 400 }
      );
    }

    // التحقق من حجم الملف (5MB كحد أقصى)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت' },
        { status: 400 }
      );
    }

    // إنشاء اسم فريد للملف
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const fileExt = file.name.split('.').pop();
    const fileName = `budget-attachments/${timestamp}-${randomString}.${fileExt}`;

    // رفع الملف إلى Vercel Blob
    const blob = await put(fileName, file, {
      access: 'public',
      contentType: file.type,
    });

    return NextResponse.json({
      url: blob.url,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });
  } catch (error) {
    console.error('Error in upload API:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء رفع الملف' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get('url');

    if (!fileUrl) {
      return NextResponse.json(
        { error: 'لم يتم تحديد رابط الملف' },
        { status: 400 }
      );
    }

    // حذف الملف من Vercel Blob
    await del(fileUrl);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in delete API:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف الملف' },
      { status: 500 }
    );
  }
}

