const {
    PutCommand,
    GetCommand,
    ScanCommand,
    UpdateCommand,
    DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");

const { docClient } = require("../config/dynamodb");

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;

/**
 * Create Coupon
 */
const createCoupon = async (couponData) => {
    const couponCode = couponData.couponCode.trim().toUpperCase();

    // Check duplicate
    const existing = await docClient.send(
        new GetCommand({
            TableName: TABLE_NAME,
            Key: {
                couponCode,
            },
        })
    );

    if (existing.Item) {
        throw new Error("Coupon already exists");
    }

    const now = new Date().toISOString();

    const coupon = {
        couponCode,
        couponName: couponData.couponName,
        description: couponData.description || "",
        discountType: couponData.discountType,
        discountValue: Number(couponData.discountValue),
        minimumOrderAmount: Number(couponData.minimumOrderAmount),
        expiryDate: couponData.expiryDate,
        isActive:
            couponData.isActive === undefined ? true : couponData.isActive,
        createdAt: now,
        updatedAt: now,
    };

    await docClient.send(
        new PutCommand({
            TableName: TABLE_NAME,
            Item: coupon,
        })
    );

    return coupon;
};

/**
 * Get All Coupons
 */
const getAllCoupons = async () => {
    const result = await docClient.send(
        new ScanCommand({
            TableName: TABLE_NAME,
        })
    );

    const coupons = result.Items || [];

    coupons.sort(
        (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
    );

    return coupons;
};

/**
 * Get Coupon By Code
 */
const getCouponByCode = async (couponCode) => {
    const result = await docClient.send(
        new GetCommand({
            TableName: TABLE_NAME,
            Key: {
                couponCode: couponCode.toUpperCase(),
            },
        })
    );

    if (!result.Item) {
        throw new Error("Coupon not found");
    }

    return result.Item;
};

/**
 * Update Coupon
 */
const updateCoupon = async (couponCode, data) => {
    const existing = await getCouponByCode(couponCode);

    const updatedCoupon = {
        ...existing,
        ...data,
        couponCode: existing.couponCode,
        updatedAt: new Date().toISOString(),
    };

    await docClient.send(
        new PutCommand({
            TableName: TABLE_NAME,
            Item: updatedCoupon,
        })
    );

    return updatedCoupon;
};

/**
 * Delete Coupon
 */
const deleteCoupon = async (couponCode) => {
    await getCouponByCode(couponCode);

    await docClient.send(
        new DeleteCommand({
            TableName: TABLE_NAME,
            Key: {
                couponCode: couponCode.toUpperCase(),
            },
        })
    );

    return {
        message: "Coupon deleted successfully",
    };
};

/**
 * Validate Coupon
 */
const validateCoupon = async ({ couponCode, cartTotal }) => {
    const coupon = await getCouponByCode(couponCode);

    if (!coupon.isActive) {
        throw new Error("Coupon is inactive");
    }

    if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
    throw new Error("Coupon has expired");
}

    if (Number(cartTotal) < Number(coupon.minimumOrderAmount)) {
        throw new Error(
            `Minimum order amount should be ₹${coupon.minimumOrderAmount}`
        );
    }

    let discount = 0;

    if (coupon.discountType === "FIXED") {
        discount = Number(coupon.discountValue);
    }

    if (coupon.discountType === "PERCENTAGE") {
        discount =
            (Number(cartTotal) * Number(coupon.discountValue)) / 100;
    }

    // Prevent discount from exceeding cart total
    if (discount > Number(cartTotal)) {
        discount = Number(cartTotal);
    }

    const finalAmount = Number(cartTotal) - discount;

    return {
        valid: true,
        couponCode: coupon.couponCode,
        couponName: coupon.couponName,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minimumOrderAmount: coupon.minimumOrderAmount,
        subtotal: Number(cartTotal),
        discount,
        finalAmount,
    };
};

module.exports = {
    createCoupon,
    getAllCoupons,
    getCouponByCode,
    updateCoupon,
    deleteCoupon,
    validateCoupon,
};