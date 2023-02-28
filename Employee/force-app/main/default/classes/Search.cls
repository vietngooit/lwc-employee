@RestResource(urlMapping='/Api/Employees/Search/*')
global class Search {
    @HttpGet
    global static Emp__c getEmployeeById() {
        RestRequest req = RestContext.request;
        String Id = req.requestURI.substring(req.requestURI.lastIndexOf('/')+1);
        return [Select Id, Name__c, Email__c, BirthDay__c, Phone__c, Memo__c From Emp__c Where Id = :Id];
    }
    @HttpPost
    global static List<Emp__c> search(String Name, String Phone) {
        try {
            String SOQL = 'Select Id, Name__c, Email__c, BirthDay__c, Phone__c, Memo__c From Emp__c';
            SOQL += ' WHERE Id != null ';
            if(Name != '') {
                String searchLikeName = '%' + Name + '%';
                SOQL += ' AND Name__c LIKE :searchLikeName ';
            }
            if(Phone != '') {
                String searchLikePhone = '%' + Phone + '%';
                SOQL += ' AND Phone__c LIKE :searchLikePhone ';
            }
            return Database.query(SOQL);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}