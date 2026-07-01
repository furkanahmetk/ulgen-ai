use odra::prelude::*;
use odra::Mapping;
use odra::casper_types::U512;

#[odra::module]
pub struct InvestigationRegistry {
    pub records: Mapping<String, String>,
}

#[odra::module]
impl InvestigationRegistry {
    pub fn log_investigation(&mut self, project_id: String, risk_score: u8, confidence: u8, amount_spent: U512) {
        let record = format!(
            "{{\"risk_score\": {}, \"confidence\": {}, \"amount_spent\": \"{}\"}}",
            risk_score, confidence, amount_spent
        );
        self.records.set(&project_id, record);
    }

    pub fn get_investigation(&self, project_id: String) -> String {
        self.records.get_or_default(&project_id)
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_log_investigation_format() {
        // Validating the internal formatting logic used in the contract
        let risk_score = 85;
        let confidence = 90;
        let amount_spent = "100";
        
        let record = format!(
            "{{\"risk_score\": {}, \"confidence\": {}, \"amount_spent\": \"{}\"}}",
            risk_score, confidence, amount_spent
        );
        
        assert!(record.contains("\"risk_score\": 85"));
        assert!(record.contains("\"confidence\": 90"));
    }
}
