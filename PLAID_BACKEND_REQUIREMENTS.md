# Plaid Backend Integration Requirements

This document outlines the backend API endpoints required for the Plaid integration to work in the Verified Wealth frontend app.

## Prerequisites

1. **Plaid Account**: Sign up at https://plaid.com and get your credentials
2. **Plaid SDK**: Install `plaid` package in your backend: `npm install plaid`
3. **Environment Variables**:
   ```
   PLAID_CLIENT_ID=your_client_id
   PLAID_SECRET=your_secret
   PLAID_ENV=sandbox  # or development, production
   ```

## Required API Endpoints

### 1. Create Link Token
**Endpoint**: `POST /api/plaid/create-link-token`

**Request Body**:
```json
{
  "userId": "user123"
}
```

**Response**:
```json
{
  "link_token": "link-sandbox-abc123...",
  "expiration": "2025-10-20T00:00:00Z"
}
```

**Backend Implementation Example** (Node.js/Express):
```javascript
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

app.post('/api/plaid/create-link-token', async (req, res) => {
  try {
    const { userId } = req.body;

    const request = {
      user: {
        client_user_id: userId,
      },
      client_name: 'Verified Wealth',
      products: ['auth', 'transactions'],
      country_codes: ['US'],
      language: 'en',
    };

    const response = await plaidClient.linkTokenCreate(request);
    res.json({
      link_token: response.data.link_token,
      expiration: response.data.expiration,
    });
  } catch (error) {
    console.error('Error creating link token:', error);
    res.status(500).json({ message: 'Failed to create link token' });
  }
});
```

---

### 2. Exchange Public Token
**Endpoint**: `POST /api/plaid/exchange-public-token`

**Request Body**:
```json
{
  "publicToken": "public-sandbox-xyz...",
  "metadata": {
    "institution": {
      "name": "Chase",
      "institution_id": "ins_123"
    },
    "accounts": [
      {
        "id": "acc_123",
        "name": "Checking",
        "type": "depository",
        "subtype": "checking"
      }
    ]
  }
}
```

**Response**:
```json
{
  "accessToken": "access-sandbox-abc...",
  "itemId": "item_123",
  "accounts": [
    {
      "id": "acc_123",
      "name": "Checking",
      "type": "depository",
      "subtype": "checking",
      "balance": 1000.50
    }
  ]
}
```

**Backend Implementation Example**:
```javascript
app.post('/api/plaid/exchange-public-token', async (req, res) => {
  try {
    const { publicToken, metadata } = req.body;

    // Exchange public token for access token
    const tokenResponse = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const accessToken = tokenResponse.data.access_token;
    const itemId = tokenResponse.data.item_id;

    // Get account balances
    const balanceResponse = await plaidClient.accountsBalanceGet({
      access_token: accessToken,
    });

    // Store access token securely in your database
    // Associate with user and accounts
    await db.query(
      'INSERT INTO plaid_items (user_id, access_token, item_id, institution_name) VALUES (?, ?, ?, ?)',
      [req.user.id, accessToken, itemId, metadata.institution.name]
    );

    // Store account information
    const accounts = balanceResponse.data.accounts.map(acc => ({
      id: acc.account_id,
      name: acc.name,
      type: acc.type,
      subtype: acc.subtype,
      balance: acc.balances.current,
    }));

    for (const account of accounts) {
      await db.query(
        'INSERT INTO accounts (user_id, plaid_account_id, name, type, subtype, balance) VALUES (?, ?, ?, ?, ?, ?)',
        [req.user.id, account.id, account.name, account.type, account.subtype, account.balance]
      );
    }

    res.json({
      accessToken, // Don't actually send this to frontend in production
      itemId,
      accounts,
    });
  } catch (error) {
    console.error('Error exchanging public token:', error);
    res.status(500).json({ message: 'Failed to exchange public token' });
  }
});
```

---

### 3. Refresh Balances (Optional but Recommended)
**Endpoint**: `POST /api/plaid/refresh-balances`

**Request Body**:
```json
{
  "userId": "user123"
}
```

**Backend Implementation Example**:
```javascript
app.post('/api/plaid/refresh-balances', async (req, res) => {
  try {
    const { userId } = req.body;

    // Get all Plaid items for this user
    const items = await db.query(
      'SELECT access_token FROM plaid_items WHERE user_id = ?',
      [userId]
    );

    for (const item of items) {
      // Get updated balances
      const balanceResponse = await plaidClient.accountsBalanceGet({
        access_token: item.access_token,
      });

      // Update balances in database
      for (const account of balanceResponse.data.accounts) {
        await db.query(
          'UPDATE accounts SET balance = ?, updated_at = NOW() WHERE plaid_account_id = ?',
          [account.balances.current, account.account_id]
        );
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error refreshing balances:', error);
    res.status(500).json({ message: 'Failed to refresh balances' });
  }
});
```

---

## Database Schema Example

```sql
-- Plaid Items (one per institution connection)
CREATE TABLE plaid_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(255) NOT NULL,
  access_token TEXT NOT NULL,  -- Store encrypted in production!
  item_id VARCHAR(255) NOT NULL,
  institution_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id)
);

-- User Accounts
CREATE TABLE accounts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(255) NOT NULL,
  plaid_account_id VARCHAR(255),
  institution_name VARCHAR(255),
  account_name VARCHAR(255),
  account_type VARCHAR(50),  -- depository, credit, loan, investment
  account_subtype VARCHAR(50),  -- checking, savings, credit card, etc.
  balance DECIMAL(15, 2),
  currency VARCHAR(3) DEFAULT 'USD',
  is_verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id)
);
```

---

## Security Considerations

1. **NEVER** store Plaid access tokens in plain text
2. Encrypt access tokens before storing in database
3. Use HTTPS for all API communications
4. Implement rate limiting on Plaid endpoints
5. Validate user authentication before allowing Plaid operations
6. Don't send access tokens to the frontend
7. Implement proper error handling and logging

---

## Testing with Plaid Sandbox

Plaid provides a sandbox environment for testing. Use these credentials in the Plaid Link flow:

- **Username**: `user_good`
- **Password**: `pass_good`

These credentials will allow you to test the full flow without connecting real bank accounts.

---

## Next Steps

1. Set up backend server with the endpoints above
2. Configure Plaid credentials in your backend environment
3. Test the integration using Plaid sandbox
4. Update the frontend `API_BASE_URL` in `.env` file to point to your backend
5. Test the complete flow from the mobile app

---

## Additional Resources

- [Plaid Quickstart Guide](https://plaid.com/docs/quickstart/)
- [Plaid API Reference](https://plaid.com/docs/api/)
- [React Native Plaid Link SDK](https://github.com/plaid/react-native-plaid-link-sdk)
