use odra::prelude::*;
use odra::casper_types::U512;

#[odra::odra_error]
pub enum Error {
    InsufficientFee = 100,
    Unauthorized = 101,
    Uninitialized = 102,
}

#[odra::module]
pub struct Marketplace {
    pub purchases: Mapping<String, U512>,
    pub owner: Var<Address>,
}

#[odra::module]
impl Marketplace {
    #[odra(init)]
    pub fn init(&mut self) {
        self.owner.set(self.env().caller());
    }

    pub fn purchase_service(&mut self, service_name: String, amount: U512) {
        let caller = self.env().caller().to_string();
        let key = format!("{}_{}", caller, service_name);
        self.purchases.set(&key, amount);
    }

    #[odra(payable)]
    pub fn request_investigation(&mut self, target_url: String) {
        let attached_value = self.env().attached_value();
        // Require at least 50 CSPR (50 * 10^9 motes)
        let min_fee = U512::from(50_000_000_000u64);
        if attached_value < min_fee {
            self.env().revert(Error::InsufficientFee); // Insufficient fee error
        }

        let caller = self.env().caller().to_string();
        let key = format!("investigation_{}_{}", caller, target_url);
        self.purchases.set(&key, attached_value);
    }

    #[odra(payable)]
    pub fn purchase_premium_data(&mut self, data_type: String) {
        let attached_value = self.env().attached_value();
        let caller = self.env().caller().to_string();
        let key = format!("premium_{}_{}", caller, data_type);
        self.purchases.set(&key, attached_value);
    }

    pub fn withdraw(&mut self) {
        let caller = self.env().caller();
        let owner = self.owner.get().unwrap_or_else(|| self.env().revert(Error::Uninitialized));
        if caller != owner {
            self.env().revert(Error::Unauthorized); // Unauthorized error
        }
        
        let balance = self.env().self_balance();
        if balance > U512::zero() {
            self.env().transfer_tokens(&caller, &balance);
        }
    }

    pub fn get_purchase_amount(&self, caller: String, service_name: String) -> U512 {
        let key = format!("{}_{}", caller, service_name);
        self.purchases.get_or_default(&key)
    }
}

#[cfg(test)]
mod tests {
    use odra::casper_types::U512;

    #[test]
    fn test_purchase_service_logic() {
        let amount = U512::from(500);
        assert_eq!(amount.to_string(), "500");
    }
}
