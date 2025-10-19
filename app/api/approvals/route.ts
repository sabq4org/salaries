import { NextRequest, NextResponse } from 'next/server';
import {
  getPendingApprovals,
  getApprovalsByStatus,
  approveRequest,
  rejectRequest,
  type ApprovalStatus,
} from '@/lib/maker-checker';

/**
 * GET - الحصول على الموافقات المعلقة
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as ApprovalStatus | null;

    let approvals;
    if (status) {
      approvals = await getApprovalsByStatus(status);
    } else {
      approvals = await getPendingApprovals();
    }

    return NextResponse.json(approvals);
  } catch (error) {
    console.error('GET /api/approvals error:', error);
    return NextResponse.json({ error: 'Failed to fetch approvals' }, { status: 500 });
  }
}

/**
 * POST - الموافقة أو رفض طلب
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { approvalId, action, checkerId, checkerName, checkerComment } = body;

    if (!approvalId || !action || !checkerId || !checkerName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let result;
    if (action === 'approve') {
      result = await approveRequest(approvalId, checkerId, checkerName, checkerComment);
    } else if (action === 'reject') {
      result = await rejectRequest(approvalId, checkerId, checkerName, checkerComment);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /api/approvals error:', error);
    return NextResponse.json({ error: 'Failed to process approval' }, { status: 500 });
  }
}

