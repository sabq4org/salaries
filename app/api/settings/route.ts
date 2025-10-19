import { NextRequest, NextResponse } from 'next/server';
import {
  getAllSettings,
  getSettingsByCategory,
  updateSetting,
  createSetting,
  deleteSetting,
} from '@/lib/settings';

/**
 * GET - الحصول على جميع الإعدادات أو حسب الفئة
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let settings;
    if (category) {
      settings = await getSettingsByCategory(category);
    } else {
      settings = await getAllSettings();
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('GET /api/settings error:', error);
    return NextResponse.json(
      { error: 'فشل في تحميل الإعدادات' },
      { status: 500 }
    );
  }
}

/**
 * POST - إنشاء إعداد جديد
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value, category, label, description, dataType, isEditable } = body;

    if (!key || !value || !category || !label) {
      return NextResponse.json(
        { error: 'بيانات غير مكتملة' },
        { status: 400 }
      );
    }

    const result = await createSetting({
      key,
      value,
      category,
      label,
      description,
      dataType: dataType || 'string',
      isEditable: isEditable !== undefined ? isEditable : true,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      setting: result.setting,
    });
  } catch (error) {
    console.error('POST /api/settings error:', error);
    return NextResponse.json(
      { error: 'فشل في إنشاء الإعداد' },
      { status: 500 }
    );
  }
}

/**
 * PUT - تحديث إعداد موجود
 */
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { error: 'مفتاح الإعداد مطلوب' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { value, userId, userName } = body;

    if (value === undefined || value === null) {
      return NextResponse.json(
        { error: 'القيمة مطلوبة' },
        { status: 400 }
      );
    }

    const result = await updateSetting(
      key,
      value.toString(),
      userId || 'admin',
      userName || 'المسؤول'
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      setting: result.setting,
    });
  } catch (error) {
    console.error('PUT /api/settings error:', error);
    return NextResponse.json(
      { error: 'فشل في تحديث الإعداد' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - حذف إعداد
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { error: 'مفتاح الإعداد مطلوب' },
        { status: 400 }
      );
    }

    const result = await deleteSetting(key, 'admin', 'المسؤول');

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/settings error:', error);
    return NextResponse.json(
      { error: 'فشل في حذف الإعداد' },
      { status: 500 }
    );
  }
}

