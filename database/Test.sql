SELECT
    u.id AS 'Customer ID',
    CONCAT(u.FIRST_NAME, ' ', u.LAST_NAME) AS 'Customer Name',
    p.PRODUCT_ID AS 'Product ID',
    p.PRODUCT_NAME AS 'Product Name',
    oi.QUANTITY AS 'Qty Sold',
    oi.PRICE AS 'Unit Price',
    (oi.QUANTITY * oi.PRICE) AS 'Amount Sales',
    o.ORDER_DATE AS 'Date'
FROM `USER` u
JOIN `ORDERS` o
    ON u.id = o.CUSTOMER_ID
JOIN `ORDER_ITEM` oi
    ON o.ORDER_ID = oi.ORDER_ID
JOIN `PRODUCT` p
    ON oi.PRODUCT_ID = p.PRODUCT_ID
WHERE
    u.role = 'customer'
    AND o.ORDER_DATE >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
ORDER BY o.ORDER_DATE DESC;
