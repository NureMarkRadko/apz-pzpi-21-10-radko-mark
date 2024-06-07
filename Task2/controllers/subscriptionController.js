const jwt = require('jsonwebtoken');
const { Subscription } = require('../models/models');

class SubscriptionController {
    constructor() {
        this.RETURN_URL = 'http://localhost:5000/api/public-user/subscribe/succeed'; //if sub is true
        this.CANCEL_URL = 'http://localhost:5000/api/subscription/pay-pal-cancel-payment'; //if sub is false
        this.AUTH = Buffer.from(process.env.CLIENT_ID + ':' + process.env.PAY_PAL_SECRET_KEY).toString('base64');
        this.SUBSCRIPTION_PAY_LOAD = {
            "plan_id": process.env.PLAN_ID,
            "application_context": {
                "brand_name": "TaskSync Subscription",
                "locale": "en-US",
                "user_action": "SUBSCRIBE_NOW",
                "payment_method": {
                    "payer_selected": "PAYPAL",
                    "payee_preferred": "IMMEDIATE_PAYMENT_REQUIRED"
                },
                "return_url": this.RETURN_URL,
                "cancel_url": this.CANCEL_URL
            }
        };
    }

    async create(req, res) {
        try {
            const fetch = (await import('node-fetch')).default;


            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            const UserId = decoded.UserId;

            // send request to PayPal to create a sub
            const response = await fetch('https://api-m.sandbox.paypal.com/v1/billing/subscriptions', {
                method: 'post',
                body: JSON.stringify(this.SUBSCRIPTION_PAY_LOAD),
                headers: {
                    'Authorization': 'Basic ' + this.AUTH,
                    'Content-Type': 'application/json'
                }
            });

            const subscriptionDetails = await response.json();

            if (response.status !== 201) {
                return res.status(response.status).json(subscriptionDetails);
            }

            // Add a sub to DB
            const newSubscription = await Subscription.create({
                UserId: UserId,
                ValidUntil: null,
                IsValid: false,
                PayPalSubscriptionId: subscriptionDetails.id
            });

            return res.status(201).json({
                subscription: newSubscription,
                approvalUrl: subscriptionDetails.links.find(link => link.rel === 'approve').href
            });
        } catch (error) {
            console.error('Error when create a sub:', error);
            return res.status(500).json({ message: "Error when create a sub" });
        }
    }

    async isSubscriptionValid(req, res) {
        try {
            const fetch = (await import('node-fetch')).default;

            const { SubscriptionId } = req.params;
            const subscription = await Subscription.findOne({
                where: { id: SubscriptionId }
            });

            if (!subscription) {
                return res.status(404).json({ message: "Sub is not found" });
            }

            // Send request with status check PayPal
            const response = await fetch(`https://api-m.sandbox.paypal.com/v1/billing/subscriptions/${subscription.PayPalSubscriptionId}`, {
                method: 'get',
                headers: {
                    'Authorization': 'Basic ' + this.AUTH,
                    'Content-Type': 'application/json'
                }
            });

            const subscriptionDetails = await response.json();

            const isValid = subscriptionDetails.status === 'ACTIVE'
                || subscriptionDetails.status === 'APPROVAL_PENDING'
                || subscriptionDetails.status === 'EXPIRED';

            if (isValid) {
                subscription.IsValid = true;
                subscription.ValidUntil = new Date(subscriptionDetails.billing_info.next_billing_time);
                await subscription.save();
            } else {
                subscription.IsValid = false;
                await subscription.save();
            }

            return res.status(200).json({ isValid });
        } catch (error) {
            console.error('Error when checking a sub:', error);
            return res.status(500).json({ message: "Error when checking a sub" });
        }
    }
}

module.exports = new SubscriptionController();
